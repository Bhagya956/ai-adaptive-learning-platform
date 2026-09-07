import { Request, Response } from "express";
import User from "../models/User";
import RelationshipRequest from "../models/relationshipRequest.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
//
// Accepts:
//   { name, email, password, role }                         — independent student / organization
//   { name, email, password, role: "student", studentType: "mentor_based", mentorId }
//   { name, email, password, role: "student", studentType: "organization_based", organizationId }
//   { name, email, password, role: "educator", educatorType: "organization_based", organizationId }
//
// Backend determines accountStatus — frontend cannot override it.
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      // sub-type fields — never trusted for role assignment
      studentType,   // "independent" | "mentor_based" | "organization_based"
      educatorType,  // "independent" | "organization_based"
      mentorId,
      organizationId: requestedOrgId,
    } = req.body;

    // ── Uniqueness check ────────────────────────────────────────────────────
    const existingUser = await User.findOne({ email: email?.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with that email already exists." });
    }

    // ── Role validation (admin can never be self-registered) ────────────────
    const allowedRoles = ["student", "educator", "organization"];
    const assignedRole = allowedRoles.includes(role) ? role : "student";

    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Determine accountStatus and relationships ───────────────────────────
    let accountStatus: "active" | "pending" = "active";
    let educatorIdToSet: string | null = null;
    let organizationIdToSet: string | null = null;
    let requestType: "mentor_student" | "organization_student" | "organization_mentor" | null = null;
    let targetId: string | null = null;

    if (assignedRole === "student") {
      if (studentType === "mentor_based") {
        // Validate mentor exists and is an active educator
        if (!mentorId) {
          return res.status(400).json({ message: "Please select a mentor." });
        }
        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.role !== "educator") {
          return res.status(400).json({ message: "Selected mentor is not valid." });
        }
        if ((mentor as any).accountStatus !== "active") {
          return res.status(400).json({ message: "Selected mentor is not currently active." });
        }
        accountStatus = "pending";
        educatorIdToSet = mentorId;
        requestType = "mentor_student";
        targetId = mentorId;

      } else if (studentType === "organization_based") {
        if (!requestedOrgId) {
          return res.status(400).json({ message: "Please select an organization." });
        }
        const org = await User.findById(requestedOrgId);
        if (!org || org.role !== "organization") {
          return res.status(400).json({ message: "Selected organization is not valid." });
        }
        accountStatus = "pending";
        organizationIdToSet = requestedOrgId;
        requestType = "organization_student";
        targetId = requestedOrgId;

      } else {
        // Independent student — active immediately
        accountStatus = "active";
      }

    } else if (assignedRole === "educator") {
      if (educatorType === "organization_based") {
        if (!requestedOrgId) {
          return res.status(400).json({ message: "Please select an organization." });
        }
        const org = await User.findById(requestedOrgId);
        if (!org || org.role !== "organization") {
          return res.status(400).json({ message: "Selected organization is not valid." });
        }
        accountStatus = "pending";
        organizationIdToSet = requestedOrgId;
        requestType = "organization_mentor";
        targetId = requestedOrgId;

      } else {
        // Independent educator — active immediately
        accountStatus = "active";
      }

    } else if (assignedRole === "organization") {
      // Organizations are always active on self-registration
      accountStatus = "active";
    }

    // ── Create user ─────────────────────────────────────────────────────────
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      accountStatus,
      ...(educatorIdToSet && { educatorId: educatorIdToSet }),
      ...(organizationIdToSet && { organizationId: organizationIdToSet }),
    });

    // ── Create relationship request record ──────────────────────────────────
    if (requestType && targetId) {
      await RelationshipRequest.create({
        requesterId: user._id,
        requesterRole: assignedRole,
        requestType,
        targetId,
        status: "pending",
      });
    }

    // ── If pending — DO NOT issue a token ──────────────────────────────────
    if (accountStatus === "pending") {
      // Resolve target name for the response message
      const target = await User.findById(targetId).select("name").lean();
      const targetName = (target as any)?.name ?? "the reviewer";
      return res.status(201).json({
        message: `Your request to join ${targetName} has been submitted and is under review.`,
        pending: true,
        accountStatus: "pending",
      });
    }

    // ── Active user — issue token for immediate login ───────────────────────
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: (user as any).accountStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error during registration." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // ── Account status gate ─────────────────────────────────────────────────
    // Treat missing accountStatus (existing users) as "active" for backward compat.
    const status = (user as any).accountStatus ?? "active";

    if (status === "pending") {
      // Find the pending request to give a meaningful message
      const pendingRequest = await RelationshipRequest.findOne({
        requesterId: user._id,
        status: "pending",
      }).populate("targetId", "name");

      const targetName =
        pendingRequest && (pendingRequest.targetId as any)?.name
          ? (pendingRequest.targetId as any).name
          : "the reviewer";

      return res.status(403).json({
        message: `Your request to join ${targetName} is still under review.`,
        accountStatus: "pending",
      });
    }

    if (status === "rejected") {
      const rejectedRequest = await RelationshipRequest.findOne({
        requesterId: user._id,
        status: "rejected",
      })
        .sort({ reviewedAt: -1 })
        .populate("targetId", "name");

      const targetName =
        rejectedRequest && (rejectedRequest.targetId as any)?.name
          ? (rejectedRequest.targetId as any).name
          : "the reviewer";

      return res.status(403).json({
        message: `Your request to join ${targetName} was rejected.`,
        accountStatus: "rejected",
      });
    }

    // ── Issue token ─────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Resolve relationship names for the user object (for student dashboard context)
    let mentorName: string | null = null;
    let organizationName: string | null = null;

    if ((user as any).educatorId) {
      const mentor = await User.findById((user as any).educatorId).select("name").lean();
      mentorName = (mentor as any)?.name ?? null;
    }
    if ((user as any).organizationId) {
      const org = await User.findById((user as any).organizationId).select("name").lean();
      organizationName = (org as any)?.name ?? null;
    }

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: status,
        // relationship context — used by student dashboard and sidebar
        educatorId: (user as any).educatorId ?? null,
        organizationId: (user as any).organizationId ?? null,
        mentorName,
        organizationName,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/mentors
// Returns a list of active, independent educators that students can request to join.
// Public — no auth required.
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailableMentors = async (_req: Request, res: Response) => {
  try {
    const mentors = await User.find({
      role: "educator",
      accountStatus: "active",
      // Independent mentors only (org-created mentors are not publicly joinable)
      organizationId: null,
    })
      .select("_id name email currentRole skills careerGoal")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(mentors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch mentors." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/organizations
// Returns a list of active organizations that students/mentors can request to join.
// Public — no auth required.
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailableOrganizations = async (_req: Request, res: Response) => {
  try {
    const orgs = await User.find({
      role: "organization",
      accountStatus: "active",
    })
      .select("_id name email currentRole")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(orgs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch organizations." });
  }
};

import User from "../models/User";
import { Response } from "express";
import mongoose from "mongoose";

export const getAllUsers = async (
  req: any,
  res: Response
) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json(
      users
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch users",
    });
  }
};


export const getUserById = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json(
      user
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch user",
    });
  }
};


export const deleteUser = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findByIdAndDelete(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      message:
        "User deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete user",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users/structured
// Returns students, educators, and organizations with populated relationships.
// All relationship fields are resolved to names — no raw ObjectIds sent to UI.
// ─────────────────────────────────────────────────────────────────────────────
export const getStructuredUsers = async (req: any, res: Response) => {
  try {
    // ── All non-admin users ─────────────────────────────────────────────────
    const allStudents = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const allEducators = await User.find({ role: "educator" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const allOrganizations = await User.find({ role: "organization" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Build lookup maps for efficient name resolution
    const educatorMap = new Map(allEducators.map((e) => [e._id.toString(), e]));
    const orgMap = new Map(allOrganizations.map((o) => [o._id.toString(), o]));

    // ── Students ────────────────────────────────────────────────────────────
    const students = allStudents.map((s: any) => {
      const mentorId = s.educatorId?.toString();
      const orgId = s.organizationId?.toString();
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        education: s.education,
        skills: s.skills,
        careerGoal: s.careerGoal,
        createdAt: s.createdAt,
        // resolved names
        mentorName: mentorId ? ((educatorMap.get(mentorId) as any)?.name ?? null) : null,
        organizationName: orgId ? ((orgMap.get(orgId) as any)?.name ?? null) : null,
        // raw flags for categorisation
        hasEducator: !!mentorId,
        hasOrganization: !!orgId,
      };
    });

    // ── Educators ───────────────────────────────────────────────────────────
    // Count students per educator
    const studentsPerEducator = new Map<string, number>();
    for (const s of allStudents as any[]) {
      if (s.educatorId) {
        const eid = s.educatorId.toString();
        studentsPerEducator.set(eid, (studentsPerEducator.get(eid) ?? 0) + 1);
      }
    }

    const educators = allEducators.map((e: any) => {
      const orgId = e.organizationId?.toString();
      return {
        _id: e._id,
        name: e.name,
        email: e.email,
        createdAt: e.createdAt,
        organizationName: orgId ? ((orgMap.get(orgId) as any)?.name ?? null) : null,
        hasOrganization: !!orgId,
        assignedStudents: studentsPerEducator.get(e._id.toString()) ?? 0,
      };
    });

    // ── Organizations ───────────────────────────────────────────────────────
    const organizations = allOrganizations.map((o: any) => {
      const oid = o._id.toString();

      // Mentors in this org
      const orgMentors = allEducators
        .filter((e: any) => e.organizationId?.toString() === oid)
        .map((e: any) => ({
          _id: e._id,
          name: e.name,
          email: e.email,
          assignedStudents: studentsPerEducator.get(e._id.toString()) ?? 0,
        }));

      // Students in this org
      const orgStudents = allStudents
        .filter((s: any) => s.organizationId?.toString() === oid)
        .map((s: any) => {
          const mentorId = s.educatorId?.toString();
          return {
            _id: s._id,
            name: s.name,
            email: s.email,
            mentorName: mentorId ? ((educatorMap.get(mentorId) as any)?.name ?? null) : null,
            hasEducator: !!mentorId,
          };
        });

      const assigned = orgStudents.filter((s) => s.hasEducator).length;

      return {
        _id: o._id,
        name: o.name,
        email: o.email,
        createdAt: o.createdAt,
        totalMentors: orgMentors.length,
        totalStudents: orgStudents.length,
        assignedStudents: assigned,
        unassignedStudents: orgStudents.length - assigned,
        mentors: orgMentors,
        students: orgStudents,
      };
    });

    // ── Summary counts ──────────────────────────────────────────────────────
    const summary = {
      totalStudents: allStudents.length,
      independentStudents: allStudents.filter(
        (s: any) => !s.educatorId && !s.organizationId
      ).length,
      educatorAssociatedStudents: allStudents.filter(
        (s: any) => s.educatorId && !s.organizationId
      ).length,
      organizationStudents: allStudents.filter(
        (s: any) => s.organizationId
      ).length,
      totalEducators: allEducators.length,
      independentEducators: allEducators.filter((e: any) => !e.organizationId).length,
      organizationEducators: allEducators.filter((e: any) => e.organizationId).length,
      totalOrganizations: allOrganizations.length,
    };

    return res.status(200).json({ students, educators, organizations, summary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch structured users." });
  }
};

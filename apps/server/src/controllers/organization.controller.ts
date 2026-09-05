import { Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Learning from "../models/learning.model";
import Quiz from "../models/quiz.model";
import Activity from "../models/activity.model";
import Assessment from "../models/assessment.model";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function orgId(req: any): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(req.user.id);
}

/** Verify a user belongs to this organization and has expected role */
async function verifyOwnership(
  userId: string,
  organizationId: string,
  expectedRole: string
): Promise<boolean> {
  const user = await User.findById(userId).select("role organizationId").lean();
  if (!user || user.role !== expectedRole) return false;
  const oid = (user as any).organizationId;
  return oid && oid.toString() === organizationId.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgDashboard = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);

    const [totalMentors, totalStudents, assignedStudents] = await Promise.all([
      User.countDocuments({ role: "educator", organizationId: oid }),
      User.countDocuments({ role: "student", organizationId: oid }),
      User.countDocuments({ role: "student", organizationId: oid, educatorId: { $ne: null } }),
    ]);

    const unassignedStudents = totalStudents - assignedStudents;

    // Active students: activity in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const studentDocs = await User.find(
      { role: "student", organizationId: oid },
      "_id"
    ).lean();
    const studentIds = studentDocs.map((s) => s._id);

    const activeStudentIds = await Activity.distinct("userId", {
      userId: { $in: studentIds },
      createdAt: { $gte: thirtyDaysAgo },
    });
    const activeStudents = activeStudentIds.length;

    // Avg completion rate across org students
    let avgProgress = 0;
    if (studentIds.length > 0) {
      const total = await Learning.countDocuments({ userId: { $in: studentIds } });
      const done = await Learning.countDocuments({
        userId: { $in: studentIds },
        status: "completed",
      });
      avgProgress = total > 0 ? Math.round((done / total) * 100) : 0;
    }

    // Mentor distribution (mentor + student count)
    const mentors = await User.find(
      { role: "educator", organizationId: oid },
      "_id name email"
    ).lean();

    const mentorDistribution = await Promise.all(
      mentors.map(async (m) => {
        const count = await User.countDocuments({
          role: "student",
          organizationId: oid,
          educatorId: m._id,
        });
        return { _id: m._id, name: m.name, email: m.email, studentCount: count };
      })
    );

    // Students needing attention: no activity in 14 days OR completionRate < 20%
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const needsAttention = await Promise.all(
      studentDocs.map(async (s) => {
        const lastAct = await Activity.findOne({ userId: s._id })
          .sort({ createdAt: -1 })
          .select("createdAt")
          .lean();
        const totalTasks = await Learning.countDocuments({ userId: s._id });
        const doneTasks = await Learning.countDocuments({ userId: s._id, status: "completed" });
        const rate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const inactive =
          !lastAct || new Date(lastAct.createdAt as Date) < fourteenDaysAgo;
        if (inactive || rate < 20) {
          const full = await User.findById(s._id).select("name email educatorId").lean();
          return { _id: s._id, name: (full as any)?.name, email: (full as any)?.email, completionRate: rate, inactive };
        }
        return null;
      })
    );

    const recentActivity = await Activity.find({ userId: { $in: studentIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .lean();

    return res.status(200).json({
      totalMentors,
      totalStudents,
      assignedStudents,
      unassignedStudents,
      activeStudents,
      avgProgress,
      mentorDistribution,
      needsAttention: needsAttention.filter(Boolean),
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch dashboard." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/mentors
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgMentors = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);
    const mentors = await User.find(
      { role: "educator", organizationId: oid },
      "-password"
    )
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      mentors.map(async (m) => {
        const students = await User.find(
          { role: "student", organizationId: oid, educatorId: m._id },
          "_id name email educatorId"
        ).lean();
        return { ...m, students };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch mentors." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organization/mentors
// Body: { name, email, password }
// Creates a new educator account belonging to this organization
// ─────────────────────────────────────────────────────────────────────────────
export const createMentor = async (req: any, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A user with that email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const mentor = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "educator",            // always educator — never trust frontend for this
      organizationId: req.user.id, // tied to this organization
    });

    return res.status(201).json({
      message: "Mentor created successfully.",
      mentor: {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        organizationId: mentor.organizationId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create mentor." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/mentors/:id
// Returns a single mentor with their students
// ─────────────────────────────────────────────────────────────────────────────
export const getMentorById = async (req: any, res: Response) => {
  try {
    if (!(await verifyOwnership(req.params.id, req.user.id, "educator"))) {
      return res.status(403).json({ message: "Access denied." });
    }

    const mentor = await User.findById(req.params.id).select("-password").lean();
    const students = await User.find(
      { role: "student", organizationId: orgId(req), educatorId: req.params.id },
      "-password"
    ).lean();

    return res.status(200).json({ mentor, students });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch mentor." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/students
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgStudents = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);
    const students = await User.find(
      { role: "student", organizationId: oid },
      "-password"
    )
      .sort({ createdAt: -1 })
      .lean();

    const result = await Promise.all(
      students.map(async (s) => {
        const totalTasks = await Learning.countDocuments({ userId: s._id });
        const doneTasks = await Learning.countDocuments({ userId: s._id, status: "completed" });
        const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const totalQuizzes = await Quiz.countDocuments({ userId: s._id });
        const lastActivity = await Activity.findOne({ userId: s._id })
          .sort({ createdAt: -1 })
          .select("activityType createdAt")
          .lean();

        let mentorName: string | null = null;
        if ((s as any).educatorId) {
          const mentor = await User.findById((s as any).educatorId).select("name").lean();
          mentorName = mentor ? (mentor as any).name : null;
        }

        return {
          ...s,
          mentorName,
          progress: { totalTasks, doneTasks, completionRate, totalQuizzes, lastActivity },
        };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch students." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organization/students
// Body: { name, email, password }
// Creates a new student account belonging to this organization
// ─────────────────────────────────────────────────────────────────────────────
export const createStudent = async (req: any, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A user with that email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      role: "student",             // always student
      organizationId: req.user.id, // tied to this organization
      educatorId: null,            // unassigned initially
    });

    return res.status(201).json({
      message: "Student created successfully.",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        organizationId: (student as any).organizationId,
        educatorId: (student as any).educatorId,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create student." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/organization/students/:id/assign-mentor
// Body: { mentorId: string }
// Assigns or reassigns a student to one of this org's mentors
// ─────────────────────────────────────────────────────────────────────────────
export const assignMentor = async (req: any, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: "mentorId is required." });
    }

    // Verify student belongs to this org
    if (!(await verifyOwnership(studentId, req.user.id, "student"))) {
      return res.status(403).json({ message: "Student does not belong to your organization." });
    }

    // Verify mentor belongs to this org
    if (!(await verifyOwnership(mentorId, req.user.id, "educator"))) {
      return res.status(403).json({ message: "Mentor does not belong to your organization." });
    }

    await User.findByIdAndUpdate(studentId, { educatorId: mentorId });

    return res.status(200).json({ message: "Mentor assigned successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to assign mentor." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/organization/students/:id/remove-mentor
// Removes the mentor assignment — student becomes unassigned (stays in org)
// ─────────────────────────────────────────────────────────────────────────────
export const removeMentor = async (req: any, res: Response) => {
  try {
    const { id: studentId } = req.params;

    if (!(await verifyOwnership(studentId, req.user.id, "student"))) {
      return res.status(403).json({ message: "Student does not belong to your organization." });
    }

    await User.findByIdAndUpdate(studentId, { educatorId: null });

    return res.status(200).json({ message: "Mentor removed. Student is now unassigned." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove mentor." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/analytics
// Organization-scoped analytics
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgAnalytics = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);

    const studentDocs = await User.find(
      { role: "student", organizationId: oid },
      "_id name"
    ).lean();
    const studentIds = studentDocs.map((s) => s._id);
    const mentorDocs = await User.find(
      { role: "educator", organizationId: oid },
      "_id name"
    ).lean();

    const totalStudents = studentIds.length;
    const totalMentors = mentorDocs.length;
    const assignedStudents = await User.countDocuments({
      role: "student", organizationId: oid, educatorId: { $ne: null },
    });

    // Learning stats
    const totalTasks = await Learning.countDocuments({ userId: { $in: studentIds } });
    const completedTasks = await Learning.countDocuments({
      userId: { $in: studentIds }, status: "completed",
    });
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Quiz stats
    const totalQuizzes = await Quiz.countDocuments({ userId: { $in: studentIds } });
    const quizzesWithScore = await Quiz.find({
      userId: { $in: studentIds }, score: { $gt: 0 },
    }).lean();
    const avgQuizScore =
      quizzesWithScore.length > 0
        ? Math.round(
            quizzesWithScore.reduce(
              (s, q) => s + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizzesWithScore.length
          )
        : 0;

    // Activity breakdown
    const activities = await Activity.find({ userId: { $in: studentIds } }).lean();
    const activityBreakdown: Record<string, number> = {};
    activities.forEach((a) => {
      const k = a.activityType ?? "unknown";
      activityBreakdown[k] = (activityBreakdown[k] ?? 0) + 1;
    });

    // Per-student stats
    const studentStats = await Promise.all(
      studentDocs.map(async (s) => {
        const total = await Learning.countDocuments({ userId: s._id });
        const done = await Learning.countDocuments({ userId: s._id, status: "completed" });
        const quizzes = await Quiz.countDocuments({ userId: s._id });
        return {
          name: (s as any).name,
          totalTasks: total,
          completedTasks: done,
          completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
          totalQuizzes: quizzes,
        };
      })
    );

    // Per-mentor student counts
    const mentorStats = await Promise.all(
      mentorDocs.map(async (m) => {
        const count = await User.countDocuments({
          role: "student", organizationId: oid, educatorId: m._id,
        });
        return { name: (m as any).name, studentCount: count };
      })
    );

    return res.status(200).json({
      totalStudents,
      totalMentors,
      assignedStudents,
      unassignedStudents: totalStudents - assignedStudents,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      totalQuizzes,
      avgQuizScore,
      activityBreakdown,
      studentStats,
      mentorStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch analytics." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/activity
// Activity of all org students and mentors (org-scoped)
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgActivity = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);

    const orgMemberIds = (await User.distinct("_id", {
      organizationId: oid,
      role: { $in: ["student", "educator"] },
    })) as mongoose.Types.ObjectId[];

    const activities = await Activity.find({ userId: { $in: orgMemberIds } })
      .sort({ createdAt: -1 })
      .limit(60)
      .populate("userId", "name email role")
      .lean();

    return res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch activity." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/organization/assessments
// All assessments created by org's mentors, with per-student attempt status
// ─────────────────────────────────────────────────────────────────────────────
export const getOrgAssessments = async (req: any, res: Response) => {
  try {
    const oid = orgId(req);

    // Get all mentors in this org
    const mentorIds = (await User.distinct("_id", { role: "educator", organizationId: oid })) as mongoose.Types.ObjectId[];

    const assessments = await Assessment.find({ educatorId: { $in: mentorIds } })
      .sort({ createdAt: -1 })
      .populate("quizId", "topic totalQuestions")
      .populate("educatorId", "name email")
      .lean();

    // Populate student names for each assignedTo entry
    const populated = await Promise.all(
      assessments.map(async (a) => {
        const assignedWithNames = await Promise.all(
          a.assignedTo.map(async (entry: any) => {
            const student = await User.findById(entry.studentId).select("name email").lean();
            return {
              ...entry,
              studentName: (student as any)?.name ?? "Unknown",
              studentEmail: (student as any)?.email ?? "",
            };
          })
        );
        return { ...a, assignedTo: assignedWithNames };
      })
    );

    return res.status(200).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch assessments." });
  }
};

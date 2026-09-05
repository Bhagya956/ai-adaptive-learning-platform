import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Learning from "../models/learning.model";
import Quiz from "../models/quiz.model";
import Activity from "../models/activity.model";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get the ObjectIds of students assigned to this educator
// ─────────────────────────────────────────────────────────────────────────────
async function getAssignedLearnerIds(educatorId: string): Promise<mongoose.Types.ObjectId[]> {
  const learners = await User.find(
    { role: "student", educatorId: new mongoose.Types.ObjectId(educatorId) },
    "_id"
  ).lean();
  return learners.map((l) => l._id as mongoose.Types.ObjectId);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getEducatorDashboard = async (req: any, res: Response) => {
  try {
    const learnerIds = await getAssignedLearnerIds(req.user.id);
    const totalLearners = learnerIds.length;

    if (totalLearners === 0) {
      return res.status(200).json({
        totalLearners: 0,
        activeLearners: 0,
        totalLearningTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        totalQuizzes: 0,
        avgQuizScore: 0,
        recentActivity: [],
      });
    }

    const totalLearningTasks = await Learning.countDocuments({ userId: { $in: learnerIds } });
    const completedTasks = await Learning.countDocuments({
      userId: { $in: learnerIds },
      status: "completed",
    });
    const totalQuizzes = await Quiz.countDocuments({ userId: { $in: learnerIds } });

    // Active learners: assigned students with activity in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivityUserIds = await Activity.distinct("userId", {
      userId: { $in: learnerIds },
      createdAt: { $gte: thirtyDaysAgo },
    });
    const activeLearners = recentActivityUserIds.length;

    const completionRate =
      totalLearningTasks > 0
        ? Math.round((completedTasks / totalLearningTasks) * 100)
        : 0;

    // Average quiz score across assigned learners
    const quizzesWithScore = await Quiz.find({
      userId: { $in: learnerIds },
      score: { $gt: 0 },
    });
    const avgQuizScore =
      quizzesWithScore.length > 0
        ? Math.round(
            quizzesWithScore.reduce(
              (sum, q) =>
                sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizzesWithScore.length
          )
        : 0;

    // Recent activity of assigned learners only
    const recentActivity = await Activity.find({ userId: { $in: learnerIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email");

    return res.status(200).json({
      totalLearners,
      activeLearners,
      totalLearningTasks,
      completedTasks,
      completionRate,
      totalQuizzes,
      avgQuizScore,
      recentActivity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch educator dashboard" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/learners
// Returns only students assigned to this educator
// ─────────────────────────────────────────────────────────────────────────────
export const getMyLearners = async (req: any, res: Response) => {
  try {
    const learners = await User.find({
      role: "student",
      educatorId: new mongoose.Types.ObjectId(req.user.id),
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const learnersWithProgress = await Promise.all(
      learners.map(async (learner) => {
        const totalTasks = await Learning.countDocuments({ userId: learner._id });
        const completedTasks = await Learning.countDocuments({
          userId: learner._id,
          status: "completed",
        });
        const totalQuizzes = await Quiz.countDocuments({ userId: learner._id });
        const lastActivity = await Activity.findOne({ userId: learner._id })
          .sort({ createdAt: -1 })
          .select("activityType createdAt");

        const completionRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          _id: learner._id,
          name: learner.name,
          email: learner.email,
          currentRole: (learner as any).currentRole,
          careerGoal: (learner as any).careerGoal,
          skills: (learner as any).skills,
          createdAt: learner.createdAt,
          progress: { totalTasks, completedTasks, completionRate, totalQuizzes, lastActivity },
        };
      })
    );

    return res.status(200).json(learnersWithProgress);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch learners" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/learners/:id
// Returns detailed progress — 403 if learner not assigned to this educator
// ─────────────────────────────────────────────────────────────────────────────
export const getLearnerProgress = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const learner = await User.findById(id).select("-password");
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }
    if (learner.role !== "student") {
      return res.status(403).json({ message: "Access denied." });
    }
    // ── SECURITY: ensure this learner is actually assigned to the requesting educator ──
    const assignedEducatorId = (learner as any).educatorId;
    if (
      !assignedEducatorId ||
      assignedEducatorId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied. This learner is not assigned to you." });
    }

    const learningTasks = await Learning.find({ userId: id }).sort({ createdAt: -1 });
    const quizHistory = await Quiz.find({ userId: id })
      .sort({ createdAt: -1 })
      .select("topic score totalQuestions createdAt");
    const activityTimeline = await Activity.find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(20);

    const totalTasks = learningTasks.length;
    const completedTasks = learningTasks.filter((t) => t.status === "completed").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const avgQuizScore =
      quizHistory.length > 0
        ? Math.round(
            quizHistory.reduce(
              (sum, q) =>
                sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizHistory.length
          )
        : 0;

    return res.status(200).json({
      learner,
      progress: { totalTasks, completedTasks, completionRate, totalQuizzes: quizHistory.length, avgQuizScore },
      learningTasks,
      quizHistory,
      activityTimeline,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch learner progress" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/educator/learners/assign
// Body: { email: string }
// Assigns an existing student to this educator
// ─────────────────────────────────────────────────────────────────────────────
export const assignLearner = async (req: any, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Student email is required." });
    }

    const student = await User.findOne({ email: email.trim().toLowerCase() });
    if (!student) {
      return res.status(404).json({ message: "No user found with that email." });
    }
    if (student.role !== "student") {
      return res.status(400).json({ message: "That user is not a student." });
    }

    // Prevent assigning a student already assigned to another educator
    const existingEducatorId = (student as any).educatorId;
    if (existingEducatorId && existingEducatorId.toString() !== req.user.id.toString()) {
      return res.status(409).json({ message: "This student is already assigned to another educator." });
    }
    if (existingEducatorId && existingEducatorId.toString() === req.user.id.toString()) {
      return res.status(409).json({ message: "This student is already in your learner list." });
    }

    await User.findByIdAndUpdate(student._id, { educatorId: req.user.id });

    return res.status(200).json({
      message: "Learner assigned successfully.",
      learner: { _id: student._id, name: student.name, email: student.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to assign learner." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/educator/learners/:id/remove
// Removes the educator-student relationship (student becomes independent)
// ─────────────────────────────────────────────────────────────────────────────
export const removeLearner = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Learner not found." });
    }
    const existingEducatorId = (student as any).educatorId;
    if (!existingEducatorId || existingEducatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "This learner is not assigned to you." });
    }

    await User.findByIdAndUpdate(id, { educatorId: null });

    return res.status(200).json({ message: "Learner removed from your list." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove learner." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/analytics
// Analytics scoped to assigned learners only
// ─────────────────────────────────────────────────────────────────────────────
export const getEducatorAnalytics = async (req: any, res: Response) => {
  try {
    const learnerIds = await getAssignedLearnerIds(req.user.id);
    const totalLearners = learnerIds.length;

    if (totalLearners === 0) {
      return res.status(200).json({
        totalLearners: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        totalQuizzes: 0,
        avgQuizScore: 0,
        activityBreakdown: {},
        recentQuizzes: [],
        learnerStats: [],
      });
    }

    const totalTasks = await Learning.countDocuments({ userId: { $in: learnerIds } });
    const completedTasks = await Learning.countDocuments({
      userId: { $in: learnerIds },
      status: "completed",
    });
    const pendingTasks = await Learning.countDocuments({
      userId: { $in: learnerIds },
      status: "pending",
    });
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalQuizzes = await Quiz.countDocuments({ userId: { $in: learnerIds } });
    const quizzesWithScore = await Quiz.find({
      userId: { $in: learnerIds },
      score: { $gt: 0 },
    });
    const avgQuizScore =
      quizzesWithScore.length > 0
        ? Math.round(
            quizzesWithScore.reduce(
              (sum, q) =>
                sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizzesWithScore.length
          )
        : 0;

    // Activity breakdown scoped to assigned learners
    const activities = await Activity.find({ userId: { $in: learnerIds } });
    const activityBreakdown: Record<string, number> = {};
    activities.forEach((a) => {
      const key = a.activityType ?? "unknown";
      activityBreakdown[key] = (activityBreakdown[key] ?? 0) + 1;
    });

    // Recent quiz results scoped to assigned learners
    const recentQuizzes = await Quiz.find({ userId: { $in: learnerIds }, score: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email")
      .select("topic score totalQuestions createdAt userId");

    // Per-learner stats
    const learners = await User.find({
      _id: { $in: learnerIds },
    }).select("_id name");

    const learnerStats = await Promise.all(
      learners.map(async (l) => {
        const total = await Learning.countDocuments({ userId: l._id });
        const done = await Learning.countDocuments({ userId: l._id, status: "completed" });
        const quizzes = await Quiz.countDocuments({ userId: l._id });
        return {
          name: l.name,
          totalTasks: total,
          completedTasks: done,
          completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
          totalQuizzes: quizzes,
        };
      })
    );

    return res.status(200).json({
      totalLearners,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      totalQuizzes,
      avgQuizScore,
      activityBreakdown,
      recentQuizzes,
      learnerStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch educator analytics" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/learning-tracker
// Learning task tracker scoped to assigned learners only
// ─────────────────────────────────────────────────────────────────────────────
export const getLearningTracker = async (req: any, res: Response) => {
  try {
    const learnerIds = await getAssignedLearnerIds(req.user.id);

    if (learnerIds.length === 0) {
      return res.status(200).json([]);
    }

    const learners = await User.find({ _id: { $in: learnerIds } }).select("_id name email");

    const trackerData = await Promise.all(
      learners.map(async (learner) => {
        const tasks = await Learning.find({ userId: learner._id })
          .sort({ createdAt: -1 })
          .limit(5);
        const totalTasks = await Learning.countDocuments({ userId: learner._id });
        const completedTasks = await Learning.countDocuments({
          userId: learner._id,
          status: "completed",
        });
        return {
          learner: { _id: learner._id, name: learner.name, email: learner.email },
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          recentTasks: tasks,
        };
      })
    );

    return res.status(200).json(trackerData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch learning tracker" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/activity
// Activity timeline of assigned learners (not the educator's own activity)
// ─────────────────────────────────────────────────────────────────────────────
export const getLearnerActivityTimeline = async (req: any, res: Response) => {
  try {
    const learnerIds = await getAssignedLearnerIds(req.user.id);

    if (learnerIds.length === 0) {
      return res.status(200).json([]);
    }

    const activities = await Activity.find({ userId: { $in: learnerIds } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("userId", "name email");

    return res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch learner activity." });
  }
};

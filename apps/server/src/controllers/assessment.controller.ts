import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Quiz from "../models/quiz.model";
import Assessment from "../models/assessment.model";
import { generateQuiz } from "../services/quiz.service";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: verify a learner belongs to this educator
// ─────────────────────────────────────────────────────────────────────────────
async function verifyLearnerOwnership(
  studentId: string,
  educatorId: string
): Promise<boolean> {
  const student = await User.findById(studentId).select("role educatorId");
  if (!student || student.role !== "student") return false;
  const assigned = (student as any).educatorId;
  return assigned && assigned.toString() === educatorId.toString();
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/educator/assessments
// Body: { title, topic, studentIds: string[] }
// Creates an AI quiz and assigns it to the specified learners.
// All learners must be assigned to this educator.
// ─────────────────────────────────────────────────────────────────────────────
export const createAssessment = async (req: any, res: Response) => {
  try {
    const { title, topic, studentIds } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Assessment title is required." });
    }
    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: "Quiz topic is required." });
    }
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Select at least one learner." });
    }

    // Verify every selected student belongs to this educator
    const ownershipChecks = await Promise.all(
      studentIds.map((id: string) => verifyLearnerOwnership(id, req.user.id))
    );
    if (ownershipChecks.some((ok) => !ok)) {
      return res.status(403).json({
        message: "One or more selected learners are not assigned to you.",
      });
    }

    // Generate quiz via Gemini
    const rawQuiz = await generateQuiz(topic.trim());
    let questions: any[];
    try {
      questions = JSON.parse(rawQuiz);
    } catch {
      return res.status(500).json({ message: "Failed to parse AI quiz response. Please try again." });
    }

    // Save the canonical quiz document owned by the educator
    const quiz = await Quiz.create({
      userId: req.user.id, // educator owns the template
      topic: topic.trim(),
      questions,
      totalQuestions: questions.length,
    });

    // Build assignedTo array — one pending entry per student
    const assignedTo = studentIds.map((id: string) => ({
      studentId: new mongoose.Types.ObjectId(id),
      quizId: null,
      status: "pending",
      score: null,
      totalQuestions: null,
      attemptedAt: null,
    }));

    const assessment = await Assessment.create({
      educatorId: req.user.id,
      title: title.trim(),
      quizId: quiz._id,
      assignedTo,
    });

    return res.status(201).json({ message: "Assessment created and assigned.", assessment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create assessment." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/assessments
// Returns all assessments created by this educator with per-learner attempt status
// ─────────────────────────────────────────────────────────────────────────────
export const getEducatorAssessments = async (req: any, res: Response) => {
  try {
    const assessments = await Assessment.find({ educatorId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("quizId", "topic totalQuestions")
      .lean();

    // Populate student names for the assignedTo array
    const populated = await Promise.all(
      assessments.map(async (a) => {
        const assignedWithNames = await Promise.all(
          a.assignedTo.map(async (entry: any) => {
            const student = await User.findById(entry.studentId).select("name email");
            return {
              ...entry,
              studentName: student?.name ?? "Unknown",
              studentEmail: student?.email ?? "",
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/educator/assessments/:id
// Returns a single assessment with full quiz questions (for educator preview)
// ─────────────────────────────────────────────────────────────────────────────
export const getAssessmentById = async (req: any, res: Response) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate("quizId")
      .lean();

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found." });
    }
    if ((assessment as any).educatorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.status(200).json(assessment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch assessment." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/student/assessments
// Returns all assessments assigned to the currently authenticated student
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentAssessments = async (req: any, res: Response) => {
  try {
    const assessments = await Assessment.find({
      "assignedTo.studentId": new mongoose.Types.ObjectId(req.user.id),
    })
      .populate("quizId", "topic totalQuestions questions")
      .populate("educatorId", "name")
      .lean();

    // Return only the current student's attempt entry + assessment metadata
    const result = assessments.map((a) => {
      const myAttempt = a.assignedTo.find(
        (e: any) => e.studentId.toString() === req.user.id.toString()
      );
      return {
        _id: a._id,
        title: a.title,
        quiz: a.quizId,
        educatorName: (a.educatorId as any)?.name ?? "Your Educator",
        createdAt: a.createdAt,
        attempt: myAttempt ?? null,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch assigned assessments." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/student/assessments/:id/submit
// Student submits answers for an assigned assessment.
// Creates a new Quiz document for the student's attempt and records the result.
// ─────────────────────────────────────────────────────────────────────────────
export const submitStudentAssessment = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // assessment id
    const { answers } = req.body; // [{ questionId, answer }]

    const assessment = await Assessment.findById(id).populate("quizId");
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found." });
    }

    // Verify this student is assigned
    const attemptIndex = assessment.assignedTo.findIndex(
      (e: any) => e.studentId.toString() === req.user.id.toString()
    );
    if (attemptIndex === -1) {
      return res.status(403).json({ message: "You are not assigned to this assessment." });
    }

    // Don't allow re-submission
    if ((assessment.assignedTo[attemptIndex] as any).status === "completed") {
      return res.status(409).json({ message: "You have already submitted this assessment." });
    }

    // Score the answers against the template quiz
    const templateQuiz = assessment.quizId as any;
    const questionsWithAnswers = templateQuiz.questions.map((q: any) => {
      const provided = answers.find(
        (a: any) => a.questionId === q._id.toString()
      );
      return { ...q.toObject(), userAnswer: provided?.answer ?? "" };
    });

    let score = 0;
    questionsWithAnswers.forEach((q: any) => {
      if (q.userAnswer === q.correctAnswer) score++;
    });

    const totalQuestions = questionsWithAnswers.length;

    // Create a Quiz document recording this student's attempt
    const studentQuiz = await Quiz.create({
      userId: req.user.id,
      topic: templateQuiz.topic,
      questions: questionsWithAnswers,
      score,
      totalQuestions,
    });

    // Update the attempt entry on the assessment
    (assessment.assignedTo[attemptIndex] as any).status = "completed";
    (assessment.assignedTo[attemptIndex] as any).quizId = studentQuiz._id;
    (assessment.assignedTo[attemptIndex] as any).score = score;
    (assessment.assignedTo[attemptIndex] as any).totalQuestions = totalQuestions;
    (assessment.assignedTo[attemptIndex] as any).attemptedAt = new Date();
    await assessment.save();

    return res.status(200).json({ score, totalQuestions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to submit assessment." });
  }
};

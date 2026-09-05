import mongoose from "mongoose";

// One attempt entry per assigned student
const attemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null until the student attempts the quiz
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    score: {
      type: Number,
      default: null,
    },
    totalQuestions: {
      type: Number,
      default: null,
    },
    attemptedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    // The educator who created/owns this assessment
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    // The AI-generated quiz (questions are stored in the Quiz document)
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    // One entry per assigned learner
    assignedTo: [attemptSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);

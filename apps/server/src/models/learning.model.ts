import mongoose from "mongoose";

// Status lifecycle:
//   open      → task created, not yet started
//   wip       → student started working on it
//   completed → student finished it
//
// "backlog" is NOT a stored status — it is calculated at query time
// from: status !== "completed" AND dueDate + dueTime has passed.
// "pending" is preserved as an alias for "open" for backward-compatibility
// with existing documents in MongoDB.

const learningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    // Date portion of the deadline, stored as ISO date string "YYYY-MM-DD"
    dueDate: {
      type: String,
      default: null,
    },

    // Time portion of the deadline, stored as "HH:MM" (24-hour)
    dueTime: {
      type: String,
      default: null,
    },

    // Expanded status enum — "pending" kept for backward compatibility
    status: {
      type: String,
      enum: ["pending", "open", "wip", "completed"],
      default: "open",
    },

    // When the student clicked "Start" (moved to wip)
    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Learning", learningSchema);

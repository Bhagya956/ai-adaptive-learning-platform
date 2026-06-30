import mongoose from "mongoose";

const interviewSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      targetRole: String,

      preparation: String,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "InterviewPrep",
  interviewSchema
);
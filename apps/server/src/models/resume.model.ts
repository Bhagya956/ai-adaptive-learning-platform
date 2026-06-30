import mongoose from "mongoose";

const resumeAnalysisSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      analysis: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
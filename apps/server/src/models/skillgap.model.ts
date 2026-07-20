import mongoose from "mongoose";

const skillGapSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      targetRole: {
        type: String,
        required: true,
      },

      analysis: {
        type: String,
        required: true,
      },

      missingSkills: [
        {
          type: String,
        },
      ],

      recommendations: [
        {
          type: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "SkillGapAnalysis",
  skillGapSchema
);
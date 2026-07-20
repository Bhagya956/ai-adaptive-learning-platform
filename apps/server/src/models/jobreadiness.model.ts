import mongoose from "mongoose";

const jobReadinessSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      score: {
        type: Number,
        required: true,
      },

      strengths: [
        {
          type: String,
        },
      ],

      weaknesses: [
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
  "JobReadiness",
  jobReadinessSchema
);
import mongoose from "mongoose";

const projectRecommendationSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      careerGoal: {
        type: String,
        required: true,
      },

 recommendations: [
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    skills: [
      {
        type: String,
      },
    ],

    difficulty: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
    },
  },
],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "ProjectRecommendation",
  projectRecommendationSchema
);
import mongoose from "mongoose";

const resourceRecommendationSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      skill: {
        type: String,
        required: true,
      },

      documentation: [
        {
          type: String,
        },
      ],

      youtube: [
        {
          type: String,
        },
      ],

      practicePlatforms: [
        {
          type: String,
        },
      ],

      projectIdeas: [
        {
          type: String,
        },
      ],

      courses: [
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
  "ResourceRecommendation",
  resourceRecommendationSchema
);
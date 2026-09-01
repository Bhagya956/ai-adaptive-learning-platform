import mongoose from "mongoose";

// Sub-schema for every resource item returned by Gemini.
// All five categories share the same shape: name, description, url.
const resourceItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, default: "" },
  },
  { _id: false } // no extra _id per item
);

const resourceRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    skill: {
      type: String,
      required: true,
    },

    documentation: [resourceItemSchema],
    youtube: [resourceItemSchema],
    practicePlatforms: [resourceItemSchema],
    projectIdeas: [resourceItemSchema],
    courses: [resourceItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ResourceRecommendation",
  resourceRecommendationSchema
);
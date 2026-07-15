import mongoose from "mongoose";

const portfolioAnalyzerSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      githubUsername: {
        type: String,
        required: true,
      },

      totalRepos: {
        type: Number,
        default: 0,
      },

      topLanguages: [
        {
          type: String,
        },
      ],

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

      analysis: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "PortfolioAnalyzer",
  portfolioAnalyzerSchema
);
import mongoose from "mongoose";

const mockInterviewSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        required: true,
      },

      questions: [
        {
          type: String,
        },
      ],

      answers: [
        {
          type: String,
        },
      ],

      score: {
        type: Number,
        default: 0,
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

      feedback: [
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
  "MockInterview",
  mockInterviewSchema
);
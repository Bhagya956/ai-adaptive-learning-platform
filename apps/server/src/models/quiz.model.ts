import mongoose from "mongoose";

const questionSchema =
  new mongoose.Schema({
    question: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "mcq",
        "truefalse",
      ],
      required: true,
    },

    options: [
      {
        type: String,
      },
    ],

    correctAnswer: {
      type: String,
      required: true,
    },

    userAnswer: {
      type: String,
      default: "",
    },
  });

const quizSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      topic: {
        type: String,
        required: true,
      },

      questions: [
        questionSchema,
      ],

      score: {
        type: Number,
        default: 0,
      },

      totalQuestions: {
        type: Number,
        default: 10,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Quiz",
  quizSchema
);
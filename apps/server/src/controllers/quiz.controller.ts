import { Response } from "express";

import Quiz from "../models/quiz.model";

import {
  generateQuiz,
} from "../services/quiz.service";
import { logActivity }
from "../utils/activityLogger";

export const createQuiz = async (
  req: any,
  res: Response
) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    const quizData =
      await generateQuiz(topic);

    const questions =
      JSON.parse(quizData);

    const quiz =
      await Quiz.create({
        userId: req.user.id,
        topic,
        questions,
      });
      await logActivity(
  req.user.id,
  "QUIZ",
  "Generated AI Quiz"
);

    return res.status(201).json(
      quiz
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to generate quiz",
    });
  }
};


export const submitQuiz =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const quizId =
        req.params.id;

      const { answers } =
        req.body;

      const quiz =
        await Quiz.findById(
          quizId
        );

      if (!quiz) {
        return res.status(404).json({
          message:
            "Quiz not found",
        });
      }

      let score = 0;

      quiz.questions.forEach(
        (question: any) => {

          const userAnswer =
            answers.find(
              (a: any) =>
                a.questionId ===
                question._id.toString()
            );

          if (
            userAnswer
          ) {

            question.userAnswer =
              userAnswer.answer;

            if (
              userAnswer.answer ===
              question.correctAnswer
            ) {
              score++;
            }
          }
        }
      );

      quiz.score = score;

      await quiz.save();

      return res.status(200).json({
        score,
        totalQuestions:
          quiz.totalQuestions,
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to submit quiz",
      });
    }
  };


  export const getQuizHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const quizzes =
        await Quiz.find({
          userId: req.user.id,
        })
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        quizzes
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch quiz history",
      });
    }
  };


  export const getQuizDetails =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const quizId =
        req.params.id;

      const quiz =
        await Quiz.findById(
          quizId
        );

      if (!quiz) {
        return res.status(404).json({
          message:
            "Quiz not found",
        });
      }

      return res.status(200).json(
        quiz
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch quiz",
      });
    }
  };
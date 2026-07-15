import { Response } from "express";

import MockInterview from "../models/mockInterview.model";

import {
  generateMockInterviewQuestions,
  evaluateMockInterview,
} from "../services/gemini.service";
import { logActivity }
from "../utils/activityLogger";

export const generateInterview =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const userId =
        req.user.id;

      const { role } =
        req.body;

      const questions =
        await generateMockInterviewQuestions(
          role
        );

      const interview =
        await MockInterview.create({
          userId,
          role,
          questions,
        });

        await logActivity(
  req.user.id,
  "MOCK_INTERVIEW",
  "Generated Mock Interview"
);

      return res
        .status(200)
        .json(interview);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to generate interview",
      });
    }
  };

export const submitInterview =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const { id } =
        req.params;

      const { answers } =
        req.body;

      const interview =
        await MockInterview.findById(
          id
        );

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      const evaluation =
        await evaluateMockInterview(
          interview.role,
          interview.questions,
          answers
        );

      interview.answers =
        answers;

      interview.score =
        evaluation.score;

      interview.strengths =
        evaluation.strengths;

      interview.weaknesses =
        evaluation.weaknesses;

      interview.feedback =
        evaluation.feedback;

      await interview.save();

      await logActivity(
  req.user.id,
  "MOCK_INTERVIEW",
  "Completed Mock Interview"
);

      return res
        .status(200)
        .json(interview);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to evaluate interview",
      });
    }
  };

export const getInterviewHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const interviews =
        await MockInterview.find({
          userId:
            req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res
        .status(200)
        .json(interviews);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch interview history",
      });
    }
  };
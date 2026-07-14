import { Response } from "express";

import User from "../models/User";
import SkillGapAnalysis from "../models/skillgap.model";
import ProjectRecommendation from "../models/projectRecommendation.model";

import {
  generateProjectRecommendations,
} from "../services/gemini.service";

export const generateProjects =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const latestSkillGap =
        await SkillGapAnalysis
          .findOne({
            userId:
              req.user.id,
          })
          .sort({
            createdAt: -1,
          });

      const recommendations =
        await generateProjectRecommendations(
          user,
          latestSkillGap?.analysis ||
            "No skill gap analysis available"
        );

    const saved =
  await ProjectRecommendation.create({
    userId: req.user.id,

    careerGoal:
      user.careerGoal ||
      "Not Specified",

    recommendations,
  });
         console.log(
  "Career Goal:",
  user.careerGoal
);
      return res.status(201).json(
        saved
      );

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to generate project recommendations",
        error:
          error.message,
      });

    }
  };

export const getProjectRecommendationHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const history =
        await ProjectRecommendation
          .find({
            userId:
              req.user.id,
          })
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        history
      );

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch recommendation history",
      });

    }
  };
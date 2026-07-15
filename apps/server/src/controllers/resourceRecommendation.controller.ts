import { Request, Response } from "express";

import ResourceRecommendation
from "../models/resourceRecommendation.model";

import {
  generateLearningResources,
} from "../services/gemini.service";

export const generateResourceRecommendation =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const { skill } = req.body;

      if (!skill) {
        return res.status(400).json({
          message:
            "Skill is required",
        });
      }

      const resources =
        await generateLearningResources(
          skill
        );

      const savedRecommendation =
        await ResourceRecommendation.create({
          userId: req.user.id,
          skill,
          documentation:
            resources.documentation,
          youtube:
            resources.youtube,
          practicePlatforms:
            resources.practicePlatforms,
          projectIdeas:
            resources.projectIdeas,
          courses:
            resources.courses,
        });

      return res.status(200).json(
        savedRecommendation
      );

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to generate resources",
        error: error.message,
      });
    }
  };

export const getResourceHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const history =
        await ResourceRecommendation.find({
          userId: req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        history
      );

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch history",
      });
    }
  };
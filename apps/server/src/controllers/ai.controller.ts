import { Request, Response } from "express";
import User from "../models/User";
import { generateRoadmap } from "../services/gemini.service";
import Roadmap from "../models/roadmap.model";

export const getRoadmap = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user.id;

    console.log("User ID:", userId);

    const user =
      await User.findById(userId);

    console.log("User:", user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Allow the frontend to pass profile overrides in the request body.
    // This lets the roadmap page show a pre-filled form without saving to the profile.
    const {
      currentRole, experience, skills, interestedDomains, careerGoal, education,
    } = req.body;

    const profileData = {
      currentRole:       currentRole       ?? (user as any).currentRole,
      experience:        experience        ?? (user as any).experience,
      skills:            skills            ?? (user as any).skills,
      interestedDomains: interestedDomains ?? (user as any).interestedDomains,
      careerGoal:        careerGoal        ?? (user as any).careerGoal,
      education:         education         ?? (user as any).education,
    };

    const roadmap = await generateRoadmap(profileData);

    console.log(
      "Generated Roadmap:",
      roadmap?.substring(0, 200)
    );

    const savedRoadmap =
      await Roadmap.create({
        userId,
        roadmap,
      });

    console.log(
      "Saved Roadmap:",
      savedRoadmap._id
    );

    res.status(200).json({
      roadmap,
    });
  } catch (error: any) {
    console.error(
      "ROADMAP ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Roadmap generation failed",
      error: error.message,
    });
  }
};

/* ===========================
   ROADMAP HISTORY
=========================== */

export const getRoadmapHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const roadmaps =
        await Roadmap.find({
          userId: req.user.id,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json(
        roadmaps
      );
    } catch (error: any) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch roadmap history",
      });
    }
  };
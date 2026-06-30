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

    const roadmap =
      await generateRoadmap(user);

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
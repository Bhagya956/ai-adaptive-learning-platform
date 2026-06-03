import { Request, Response } from "express";

import User from "../models/User";
import { generateRoadmap } from "../services/gemini.service";

export const getRoadmap = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const roadmap =
      await generateRoadmap(user);

    res.status(200).json({
      roadmap,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Roadmap generation failed",
    });
  }
};
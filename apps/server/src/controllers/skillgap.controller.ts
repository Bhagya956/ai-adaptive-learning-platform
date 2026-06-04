import { Request, Response } from "express";
import User from "../models/User";
import { generateSkillGapAnalysis }
from "../services/skillgap.service";

export const analyzeSkillGap = async (
  req: any,
  res: Response
) => {
  try {
    const { targetRole } = req.body;

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const analysis =
      await generateSkillGapAnalysis(
        user,
        targetRole
      );

    res.status(200).json({
      analysis,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Skill gap analysis failed",
    });
  }
};
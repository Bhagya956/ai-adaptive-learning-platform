import { Response } from "express";

import User from "../models/User";
import SkillGapAnalysis from "../models/skillgap.model";

import { generateSkillGapAnalysis }
from "../services/skillgap.service";
import { logActivity }
from "../utils/activityLogger";

export const analyzeSkillGap = async (
  req: any,
  res: Response
) => {
  try {
    const { targetRole } = req.body;

    const userId = req.user.id;

    const user =
      await User.findById(userId);

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

if (!analysis) {
  return res.status(500).json({
    message: "Failed to generate analysis",
  });
}

    await SkillGapAnalysis.create({
      userId,
      targetRole,
      analysis,
    });
    await logActivity(
  req.user.id,
  "SKILL_GAP",
  "Generated Skill Gap Analysis"
);

    return res.status(200).json({
      analysis,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Skill gap analysis failed",
    });
  }
};


export const getSkillGapHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const history =
        await SkillGapAnalysis.find({
          userId: req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        history
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch skill gap history",
      });
    }
  };
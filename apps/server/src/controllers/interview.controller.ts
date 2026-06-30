import { Response } from "express";
import User from "../models/User";
import { generateInterviewPrep } from "../services/interview.service";
import InterviewPrep from "../models/interviewprep.model";

export const generateInterviewGuide = async (
  req: any,
  res: Response
) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        message: "Target role is required",
      });
    }

    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const preparation =
      await generateInterviewPrep(
        user,
        targetRole
      );

    if (!preparation) {
      return res.status(500).json({
        message:
          "Failed to generate interview guide",
      });
    }

    await InterviewPrep.create({
      userId: req.user.id,
      targetRole,
      preparation,
    });

    return res.status(200).json({
      preparation,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Interview preparation failed",
    });
  }
};
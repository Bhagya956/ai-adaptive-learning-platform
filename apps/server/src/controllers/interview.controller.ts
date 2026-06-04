import { Response } from "express";
import User from "../models/User";
import { generateInterviewPrep }
from "../services/interview.service";

export const generateInterviewGuide =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const { targetRole } = req.body;

      if (!targetRole) {
        return res.status(400).json({
          message:
            "Target role is required",
        });
      }

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

      const guide =
        await generateInterviewPrep(
          user,
          targetRole
        );

      res.status(200).json({
        guide,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Interview preparation failed",
      });
    }
  };
import { Request, Response } from "express";

import Activity
from "../models/activity.model";

export const getActivityTimeline =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const activities =
        await Activity.find({
          userId: req.user.id,
        })
          .sort({
            createdAt: -1,
          });

      return res.status(200).json(
        activities
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch activity timeline",
      });

    }
  };
import { Response } from "express";

import Learning
from "../models/learning.model";

export const getLearningAnalytics =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const userId =
        req.user.id;

      const totalTasks =
        await Learning.countDocuments({
          userId,
        });

   const completedTasks =
  await Learning.countDocuments({
    userId,
    status: "completed",
  });

const pendingTasks =
  await Learning.countDocuments({
    userId,
    status: "pending",
  });

      const completionRate =
        totalTasks > 0
          ? Math.round(
              (
                completedTasks /
                totalTasks
              ) * 100
            )
          : 0;
          const recentCompleted =
  await Learning.find({
    userId,
    status: "completed",
  })
    .sort({
      completedAt: -1,
    })
    .limit(5);

          let insight = "";

if (completionRate >= 80) {
  insight =
    "Excellent progress. Keep up the momentum.";
}
else if (completionRate >= 50) {
  insight =
    "Good progress. Complete remaining tasks consistently.";
}
else {
  insight =
    "Learning progress is low. Focus on completing pending tasks.";
}

    return res.status(200).json({
  totalTasks,
  completedTasks,
  pendingTasks,
  completionRate,
  insight,
    recentCompleted
});

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch learning analytics",
      });

    }
  };
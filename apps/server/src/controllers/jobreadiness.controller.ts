import { Response } from "express";

import User from "../models/User";
import Learning from "../models/learning.model";
import ResumeAnalysis from "../models/resume.model";
import SkillGapAnalysis from "../models/skillgap.model";

export const getJobReadinessScore =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const userId = req.user.id;

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const resume =
        await ResumeAnalysis
          .findOne({
            userId,
          })
          .sort({
            createdAt: -1,
          });

      const skillGap =
        await SkillGapAnalysis
          .findOne({
            userId,
          })
          .sort({
            createdAt: -1,
          });

      const tasks =
        await Learning.find({
          userId,
        });

      let score = 0;

      /* --------------------
         PROFILE SCORE
      -------------------- */

      let profileScore = 0;

      if (user.currentRole)
        profileScore += 5;

      if (user.education)
        profileScore += 5;

      if (user.careerGoal)
        profileScore += 5;

      if (
        user.skills &&
        user.skills.length > 0
      )
        profileScore += 5;

      score += profileScore;

      /* --------------------
         LEARNING SCORE
      -------------------- */

      let learningScore = 0;

      if (tasks.length > 0) {
        const completedTasks =
          tasks.filter(
            (task) =>
              task.status ===
              "completed"
          ).length;

        const percentage =
          (completedTasks /
            tasks.length) *
          30;

        learningScore =
          Math.round(
            percentage
          );
      }

      score += learningScore;

      /* --------------------
         RESUME SCORE
      -------------------- */

      let resumeScore = 0;

      if (resume) {
        resumeScore = 40;
      }

      score += resumeScore;

      /* --------------------
         SKILL GAP SCORE
      -------------------- */

      let skillGapScore = 0;

      if (skillGap) {
        skillGapScore = 10;
      }

      score += skillGapScore;

      if (score > 100) {
        score = 100;
      }

      return res.status(200).json({
        jobReadinessScore:
          score,

        breakdown: {
          profileScore,
          learningScore,
          resumeScore,
          skillGapScore,
        },
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to calculate job readiness score",
      });
    }
  };
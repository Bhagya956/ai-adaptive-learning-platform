import { Request, Response } from "express";


import ResumeAnalysis from "../models/resume.model";
import SkillGapAnalysis from "../models/skillgap.model";
import Learning from "../models/learning.model";
import Quiz from "../models/quiz.model";
import JobReadiness from "../models/jobreadiness.model";
import { logActivity }
from "../utils/activityLogger";

export const generateJobReadinessScore =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const userId = req.user.id;

      /* =====================
         RESUME SCORE
      ===================== */

      const latestResume =
        await ResumeAnalysis.findOne({
          userId,
        }).sort({
          createdAt: -1,
        });

      let resumeScore = 0;

      if (latestResume) {
        try {
          const parsed =
            JSON.parse(
              latestResume.analysis
            );

          resumeScore =
            parsed.score || 0;
        } catch {
          resumeScore = 0;
        }
      }

      /* =====================
         LEARNING SCORE
      ===================== */

      const totalTasks =
        await Learning.countDocuments({
          userId,
        });

      const completedTasks =
        await Learning.countDocuments({
          userId,
          status: "completed",
        });

      const learningScore =
        totalTasks > 0
          ? Math.round(
              (completedTasks /
                totalTasks) *
                100
            )
          : 0;

      /* =====================
         QUIZ SCORE
      ===================== */

      const quizzes =
        await Quiz.find({
          userId,
        });

      let quizScore = 0;

      if (quizzes.length > 0) {
        const totalQuizScore =
          quizzes.reduce(
            (
              sum: number,
              quiz: any
            ) => {
              return (
                sum +
                (quiz.score /
                  quiz.totalQuestions) *
                  100
              );
            },
            0
          );

        quizScore = Math.round(
          totalQuizScore /
            quizzes.length
        );

        
      }

      /* =====================
         SKILL GAP SCORE
      ===================== */

      const latestSkillGap =
        await SkillGapAnalysis.findOne({
          userId,
        }).sort({
          createdAt: -1,
        });

      let skillGapScore = 100;

      let weaknesses: string[] =
        [];

      let recommendations:
        string[] = [];

      if (latestSkillGap) {
        try {
          const parsed =
            JSON.parse(
              latestSkillGap.analysis
            );

          const missingSkills =
            parsed.missingSkills ||
            [];

          skillGapScore =
            Math.max(
              100 -
                missingSkills.length *
                  10,
              0
            );

          weaknesses =
            missingSkills;

          recommendations =
            parsed.recommendations ||
            [];
        } catch {
          skillGapScore = 50;
        }
      }

      /* =====================
         FINAL SCORE
      ===================== */

      const finalScore =
        Math.round(
          resumeScore * 0.4 +
            learningScore * 0.2 +
            quizScore * 0.2 +
            skillGapScore * 0.2
        );

      const strengths = [];

      if (resumeScore >= 70)
        strengths.push(
          "Strong Resume"
        );

      if (learningScore >= 70)
        strengths.push(
          "Consistent Learning Progress"
        );

      if (quizScore >= 70)
        strengths.push(
          "Good Quiz Performance"
        );

      const savedResult =
        await JobReadiness.create({
          userId,
          score: finalScore,
          strengths,
          weaknesses,
          recommendations,
        });

await logActivity(
  req.user.id,
  "JOB_READINESS",
  "Generated Job Readiness Score"
);


      return res.status(200).json(
        savedResult
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to generate job readiness score",
      });
    }
 

 
 
  
  };

export const getJobReadinessHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const history =
        await JobReadiness.find({
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
          "Failed to fetch job readiness history",
      });
    }
  };
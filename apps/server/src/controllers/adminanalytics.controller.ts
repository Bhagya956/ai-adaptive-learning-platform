import { Request, Response } from "express";

import User from "../models/User";
import Roadmap from "../models/roadmap.model";
import ResumeAnalysis from "../models/resume.model";
import SkillGapAnalysis from "../models/skillgap.model";
import InterviewPrep from "../models/interviewprep.model";
import Learning from "../models/learning.model";
import Activity
from "../models/activity.model";

export const getAdminAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const totalRoadmaps =
      await Roadmap.countDocuments();

    const totalResumeAnalyses =
      await ResumeAnalysis.countDocuments();

    const totalSkillGapAnalyses =
      await SkillGapAnalysis.countDocuments();

    const totalInterviewPreparations =
      await InterviewPrep.countDocuments();

    const totalLearningTasks =
      await Learning.countDocuments();

    return res.status(200).json({
      totalUsers,
      totalRoadmaps,
      totalResumeAnalyses,
      totalSkillGapAnalyses,
      totalInterviewPreparations,
      totalLearningTasks,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch admin analytics",
    });
  }
};

export const getPopularSkills = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find();

    const skillCount: any = {};

    users.forEach((user: any) => {
      user.skills?.forEach(
        (skill: string) => {
          skillCount[skill] =
            (skillCount[skill] || 0) + 1;
        }
      );
    });

    const result =
      Object.entries(skillCount)
        .sort(
          (a: any, b: any) =>
            b[1] - a[1]
        )
        .slice(0, 10);

    return res.status(200).json(
      result
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch skills analytics",
    });
  }
};


export const getPopularCareerGoals =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const users =
        await User.find();

      const goals: any = {};

      users.forEach(
        (user: any) => {

          if (
            user.careerGoal
          ) {
            goals[
              user.careerGoal
            ] =
              (
                goals[
                  user.careerGoal
                ] || 0
              ) + 1;
          }

        }
      );

      const result =
        Object.entries(goals)
          .sort(
            (
              a: any,
              b: any
            ) =>
              b[1] - a[1]
          );

      return res.status(200).json(
        result
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch career goals analytics",
      });
    }
  };


  export const getUserGrowth =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const users =
        await User.find();

      const growth: any = {};

      users.forEach(
        (user: any) => {

     if (!user.createdAt) {
  return;
}

const date =
  new Date(user.createdAt);

if (
  isNaN(date.getTime())
) {
  return;
}

const month =
  date.toLocaleString(
    "default",
    {
      month: "short",
      year: "numeric",
    }
  );

          growth[month] =
            (
              growth[
                month
              ] || 0
            ) + 1;

        }
      );

      return res.status(200).json(
        growth
      );

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch user growth",
      });
    }
  };

  
  export const getPlatformUsage =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const roadmaps =
        await Roadmap.countDocuments();

      const resumes =
        await ResumeAnalysis.countDocuments();

      const skillGaps =
        await SkillGapAnalysis.countDocuments();

      const interviews =
        await InterviewPrep.countDocuments();

      const learningTasks =
        await Learning.countDocuments();

      return res.status(200).json({
        roadmaps,
        resumes,
        skillGaps,
        interviews,
        learningTasks,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch platform usage",
      });

    }
  };

  export const getMostMissingSkills =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const reports =
        await SkillGapAnalysis.find();

      const skillCount: any = {};

      reports.forEach(
        (report: any) => {

          report.missingSkills?.forEach(
            (skill: string) => {

              skillCount[skill] =
                (
                  skillCount[
                    skill
                  ] || 0
                ) + 1;

            }
          );

        }
      );

      const result =
        Object.entries(
          skillCount
        )
          .sort(
            (
              a: any,
              b: any
            ) =>
              b[1] - a[1]
          )
          .slice(0, 10);

      return res.status(200).json(
        result
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch missing skills analytics",
      });

    }
  };

  export const getActivityAnalytics =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const activities =
        await Activity.find();

      const activityCount: any = {};

      activities.forEach(
        (activity: any) => {

          activityCount[
            activity.activityType
          ] =
            (
              activityCount[
                activity.activityType
              ] || 0
            ) + 1;

        }
      );

      return res.status(200).json(
        activityCount
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch activity analytics",
      });

    }
  };
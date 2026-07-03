import { Request, Response } from "express";

import User from "../models/User";
import Roadmap from "../models/roadmap.model";
import ResumeAnalysis from "../models/resume.model";
import SkillGapAnalysis from "../models/skillgap.model";
import InterviewPrep from "../models/interviewprep.model";
import Learning from "../models/learning.model";

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
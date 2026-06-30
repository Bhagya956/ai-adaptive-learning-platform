import Roadmap from "../models/roadmap.model";
import ResumeAnalysis from "../models/resume.model";
import SkillGapAnalysis from "../models/skillgap.model";
import InterviewPrep from "../models/interviewprep.model";

export const getDashboardStats =
 async (req: any, res: any) => {
  const userId = req.user.id;

  const roadmaps =
    await Roadmap.countDocuments({
      userId,
    });

  const resumes =
    await ResumeAnalysis.countDocuments({
      userId,
    });

  const skillGaps =
    await SkillGapAnalysis.countDocuments({
      userId,
    });

  const interviews =
    await InterviewPrep.countDocuments({
      userId,
    });

  res.json({
    roadmaps,
    resumes,
    skillGaps,
    interviews,
  });
};
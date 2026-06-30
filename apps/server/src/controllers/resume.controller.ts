import { Response } from "express";
import pdfParse from "pdf-parse";

import { analyzeResumeWithAI } from "../services/resume.service";
import ResumeAnalysis from "../models/resume.model";

export const analyzeResume = async (
  req: any,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const userId = req.user.id;

    const pdfData = await pdfParse(
      req.file.buffer
    );

    const analysis =
      await analyzeResumeWithAI(
        pdfData.text
      );

    if (!analysis) {
      return res.status(500).json({
        message:
          "Failed to generate resume analysis",
      });
    }

    await ResumeAnalysis.create({
      userId,
      analysis,
    });

    return res.status(200).json({
      analysis,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Resume analysis failed",
    });
  }
};


///Resume HIstoryy//


export const getResumeHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {
      const resumes =
        await ResumeAnalysis.find({
          userId: req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        resumes
      );
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch resume history",
      });
    }
  };
import { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { analyzeResumeWithAI }
from "../services/resume.service";

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

    const pdfData = await pdfParse(
      req.file.buffer
    );

    // res.status(200).json({
    //   extractedText: pdfData.text,
    // });
    const analysis =
  await analyzeResumeWithAI(
    pdfData.text
  );

res.status(200).json({
  analysis,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Resume analysis failed",
    });
  }
};
import { Request, Response } from "express";

import PortfolioAnalyzer
from "../models/portfolioAnalyzer.model";

import {
  getGithubProfile,
} from "../services/github.service";

import {
  analyzePortfolioWithAI,
} from "../services/gemini.service";

import { logActivity }
from "../utils/activityLogger";

export const analyzePortfolio =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const userId =
        req.user.id;

      const {
        githubUsername,
      } = req.body;

      const githubData =
        await getGithubProfile(
          githubUsername
        );

      const repos =
        githubData.repos;

  const languages: string[] =
  Array.from(
    new Set(
      repos
        .map(
          (repo: any) =>
            repo.language as string
        )
        .filter(Boolean)
    )
  );

      const aiAnalysis =
        await analyzePortfolioWithAI(
          {
            totalRepos:
              repos.length,
            languages,
          }
        );

      const savedAnalysis =
        await PortfolioAnalyzer.create(
          {
            userId,
            githubUsername,

            totalRepos:
              repos.length,

            topLanguages:
              languages,

            strengths:
              aiAnalysis.strengths,

            weaknesses:
              aiAnalysis.weaknesses,

            recommendations:
              aiAnalysis.recommendations,

            analysis:
              aiAnalysis.analysis,
          }
        );

        await logActivity(
  req.user.id,
  "PORTFOLIO_ANALYSIS",
  "Analyzed GitHub Portfolio"
);

      return res.status(200).json(
        savedAnalysis
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Portfolio analysis failed",
      });
    }
  };

export const getPortfolioHistory =
  async (
    req: any,
    res: Response
  ) => {
    try {

      const history =
        await PortfolioAnalyzer.find(
          {
            userId:
              req.user.id,
          }
        ).sort({
          createdAt: -1,
        });

      return res.status(200).json(
        history
      );

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to fetch portfolio history",
      });
    }
  };
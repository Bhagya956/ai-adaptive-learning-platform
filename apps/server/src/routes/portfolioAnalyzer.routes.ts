import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  analyzePortfolio,
  getPortfolioHistory,
} from "../controllers/portfolioAnalyzer.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  analyzePortfolio
);

router.get(
  "/history",
  authMiddleware,
  getPortfolioHistory
);

export default router;
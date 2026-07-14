import express from "express";

import authMiddleware
from "../middleware/auth.middleware";

import {
  generateProjects,
  getProjectRecommendationHistory,
}
from "../controllers/projectRecommendation.controller";

const router =
  express.Router();

router.post(
  "/",
  authMiddleware,
  generateProjects
);

router.get(
  "/history",
  authMiddleware,
  getProjectRecommendationHistory
);

export default router;
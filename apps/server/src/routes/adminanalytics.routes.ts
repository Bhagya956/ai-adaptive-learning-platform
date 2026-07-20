import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getActivityAnalytics,
  getAdminAnalytics,
  getMostMissingSkills,
  getPopularCareerGoals,
  getPopularSkills,
  getUserGrowth,
} from "../controllers/adminanalytics.controller";

import { adminMiddleware }
from "../middleware/admin.middleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
    getAdminAnalytics
);

router.get(
  "/skills",
  authMiddleware,
  adminMiddleware,
  getPopularSkills
);

router.get(
  "/career-goals",
  authMiddleware,
  adminMiddleware,
  getPopularCareerGoals
);

router.get(
  "/user-growth",
  authMiddleware,
  adminMiddleware,
  getUserGrowth
);

router.get(
  "/most-missing-skills",
  getMostMissingSkills
);

router.get(
  "/activity-analytics",
  getActivityAnalytics
);

export default router;
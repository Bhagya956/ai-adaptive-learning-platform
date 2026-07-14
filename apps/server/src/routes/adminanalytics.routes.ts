import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getAdminAnalytics,
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

export default router;
import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  generateJobReadinessScore,
  getJobReadinessHistory,
} from "../controllers/jobReadiness.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  generateJobReadinessScore
);

router.get(
  "/history",
  authMiddleware,
  getJobReadinessHistory
);

export default router;
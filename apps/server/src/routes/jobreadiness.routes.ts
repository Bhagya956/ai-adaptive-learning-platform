import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getJobReadinessScore,
} from "../controllers/jobreadiness.controller";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getJobReadinessScore
);

export default router;
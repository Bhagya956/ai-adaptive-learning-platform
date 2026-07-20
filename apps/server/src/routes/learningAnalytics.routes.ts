import express from "express";

import authMiddleware
from "../middleware/auth.middleware";

import {
  getLearningAnalytics,
} from "../controllers/learningAnalytics.controller";

const router =
  express.Router();

router.get(
  "/",
  authMiddleware,
  getLearningAnalytics
);

export default router;
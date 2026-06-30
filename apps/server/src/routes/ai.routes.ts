import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getRoadmap,
  getRoadmapHistory,
} from "../controllers/ai.controller";

const router = express.Router();

router.post(
  "/roadmap",
  authMiddleware,
  getRoadmap
);

router.get(
  "/roadmaps",
  authMiddleware,
  getRoadmapHistory
);

export default router;
import express from "express";

import authMiddleware from "../middleware/auth.middleware";
import { getRoadmap } from "../controllers/ai.controller";

const router = express.Router();

router.post(
  "/roadmap",
  authMiddleware,
  getRoadmap
);

export default router;
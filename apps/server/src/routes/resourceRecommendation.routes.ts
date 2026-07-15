import express from "express";

import authMiddleware
from "../middleware/auth.middleware";

import {
  generateResourceRecommendation,
  getResourceHistory,
} from "../controllers/resourceRecommendation.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  generateResourceRecommendation
);

router.get(
  "/history",
  authMiddleware,
  getResourceHistory
);

export default router;
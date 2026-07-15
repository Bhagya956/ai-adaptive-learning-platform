import express from "express";

import authMiddleware
from "../middleware/auth.middleware";

import {
  getActivityTimeline,
} from "../controllers/activity.controller";

const router =
  express.Router();

router.get(
  "/",
  authMiddleware,
  getActivityTimeline
);

export default router;
import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  generateInterview,
  submitInterview,
  getInterviewHistory,
} from "../controllers/mockInterview.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  generateInterview
);

router.post(
  "/:id/submit",
  authMiddleware,
  submitInterview
);

router.get(
  "/history",
  authMiddleware,
  getInterviewHistory
);

export default router;
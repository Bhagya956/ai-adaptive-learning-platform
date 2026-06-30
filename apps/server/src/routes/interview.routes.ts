import express from "express";


import authMiddleware from "../middleware/auth.middleware";

import {
  generateInterviewGuide,
  getInterviewHistory,
} from "../controllers/interview.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  generateInterviewGuide
);

router.get(
  "/history",
  authMiddleware,
  getInterviewHistory
);

export default router;
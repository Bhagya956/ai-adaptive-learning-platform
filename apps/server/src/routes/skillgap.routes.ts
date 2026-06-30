import express from "express";


import authMiddleware from "../middleware/auth.middleware";

import {
  analyzeSkillGap,
  getSkillGapHistory,
}
from "../controllers/skillgap.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  analyzeSkillGap
);

router.get(
  "/history",
  authMiddleware,
  getSkillGapHistory
);

export default router;
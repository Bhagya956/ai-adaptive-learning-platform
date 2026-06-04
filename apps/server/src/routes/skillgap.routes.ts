import express from "express";


import authMiddleware from "../middleware/auth.middleware";

import { analyzeSkillGap }
from "../controllers/skillgap.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  analyzeSkillGap
);

export default router;
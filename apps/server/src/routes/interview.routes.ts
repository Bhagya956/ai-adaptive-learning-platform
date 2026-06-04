import express from "express";


import authMiddleware from "../middleware/auth.middleware";

import { generateInterviewGuide }
from "../controllers/interview.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  generateInterviewGuide
);

export default router;
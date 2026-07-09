import express from "express";

import authMiddleware
from "../middleware/auth.middleware";

import {
  createQuiz,
  submitQuiz,
  getQuizHistory,
    getQuizDetails,
}
from "../controllers/quiz.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createQuiz
);

router.put(
  "/:id/submit",
  authMiddleware,
  submitQuiz
);

router.get(
  "/history",
  authMiddleware,
  getQuizHistory
);

router.get(
  "/:id",
  authMiddleware,
  getQuizDetails
);

export default router;
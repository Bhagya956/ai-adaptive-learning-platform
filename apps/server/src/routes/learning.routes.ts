import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "../controllers/learning.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createTask
);

router.get(
  "/",
  authMiddleware,
  getTasks
);

router.put(
  "/:id",
  authMiddleware,
  updateTaskStatus
);

router.delete(
  "/:id",
  authMiddleware,
  deleteTask
);

export default router;
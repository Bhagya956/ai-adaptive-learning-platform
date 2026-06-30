import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import { getDashboardStats } from "../controllers/dashboard.controller";

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  getDashboardStats
);

export default router;
import express from "express";

import authMiddleware from "../middleware/auth.middleware";

import {
  getAdminAnalytics,
} from "../controllers/adminanalytics.controller";

import { adminMiddleware }
from "../middleware/admin.middleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
    getAdminAnalytics
);

export default router;
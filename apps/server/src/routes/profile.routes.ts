import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller";

import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getProfile
);

router.put(
  "/",
  authMiddleware,
  updateProfile
);

export default router;
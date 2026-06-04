import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import {
  analyzeResume,
} from "../controllers/resume.controller";

const router = express.Router();

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
 analyzeResume
);

export default router;
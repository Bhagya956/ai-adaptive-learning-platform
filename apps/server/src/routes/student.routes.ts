import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  getStudentAssessments,
  submitStudentAssessment,
} from "../controllers/assessment.controller";

const router = express.Router();

// Student sees assessments assigned to them
router.get("/assessments", authMiddleware, getStudentAssessments);

// Student submits an assigned assessment
router.post("/assessments/:id/submit", authMiddleware, submitStudentAssessment);

export default router;

import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import { educatorMiddleware } from "../middleware/educator.middleware";
import {
  getEducatorDashboard,
  getMyLearners,
  getLearnerProgress,
  assignLearner,
  removeLearner,
  getEducatorAnalytics,
  getLearningTracker,
  getLearnerActivityTimeline,
} from "../controllers/educator.controller";
import {
  createAssessment,
  getEducatorAssessments,
  getAssessmentById,
} from "../controllers/assessment.controller";

const router = express.Router();

// Every route requires valid JWT + educator role
router.get("/dashboard",         authMiddleware, educatorMiddleware, getEducatorDashboard);
router.get("/learners",          authMiddleware, educatorMiddleware, getMyLearners);
// assign must be registered BEFORE /:id so the literal "assign" isn't consumed as an id
router.post("/learners/assign",  authMiddleware, educatorMiddleware, assignLearner);
router.get("/learners/:id",      authMiddleware, educatorMiddleware, getLearnerProgress);
router.delete("/learners/:id/remove", authMiddleware, educatorMiddleware, removeLearner);
router.get("/analytics",         authMiddleware, educatorMiddleware, getEducatorAnalytics);
router.get("/learning-tracker",  authMiddleware, educatorMiddleware, getLearningTracker);
router.get("/activity",          authMiddleware, educatorMiddleware, getLearnerActivityTimeline);

// Assessment routes (educator-only)
router.post("/assessments",      authMiddleware, educatorMiddleware, createAssessment);
router.get("/assessments",       authMiddleware, educatorMiddleware, getEducatorAssessments);
router.get("/assessments/:id",   authMiddleware, educatorMiddleware, getAssessmentById);

export default router;

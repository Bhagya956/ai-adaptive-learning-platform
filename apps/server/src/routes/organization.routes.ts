import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import { organizationMiddleware } from "../middleware/organization.middleware";
import {
  getOrgDashboard,
  getOrgMentors,
  createMentor,
  getMentorById,
  getOrgStudents,
  createStudent,
  assignMentor,
  removeMentor,
  getOrgAnalytics,
  getOrgActivity,
  getOrgAssessments,
} from "../controllers/organization.controller";

const router = express.Router();

// All routes require valid JWT + organization role
const guard = [authMiddleware, organizationMiddleware];

router.get("/dashboard",                guard, getOrgDashboard);

router.get("/mentors",                  guard, getOrgMentors);
router.post("/mentors",                 guard, createMentor);
router.get("/mentors/:id",              guard, getMentorById);

router.get("/students",                 guard, getOrgStudents);
router.post("/students",                guard, createStudent);
router.post("/students/:id/assign-mentor",  guard, assignMentor);
router.delete("/students/:id/remove-mentor", guard, removeMentor);

router.get("/analytics",                guard, getOrgAnalytics);
router.get("/activity",                 guard, getOrgActivity);
router.get("/assessments",              guard, getOrgAssessments);

export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  getAvailableMentors,
  getAvailableOrganizations,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Public discovery endpoints (no auth required — used by register page)
router.get("/mentors", getAvailableMentors);
router.get("/organizations", getAvailableOrganizations);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "Protected profile route accessed" });
});

export default router;

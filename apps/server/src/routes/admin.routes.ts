import express from "express";

import { getAllUsers,
getUserById,
deleteUser,
getStructuredUsers } from "../controllers/admin.controller";
import { adminMiddleware } from "../middleware/admin.middleware";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

// Structured users endpoint — must come BEFORE /:id
router.get(
  "/users/structured",
  authMiddleware,
  adminMiddleware,
  getStructuredUsers
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);


router.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  getUserById
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

export default router;
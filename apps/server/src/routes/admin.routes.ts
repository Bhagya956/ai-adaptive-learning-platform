import express from "express";

import { getAllUsers,
getUserById,
deleteUser } from "../controllers/admin.controller";
import { adminMiddleware } from "../middleware/admin.middleware";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

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
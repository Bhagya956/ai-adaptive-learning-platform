import express from "express";

import { getAllUsers } from "../controllers/admin.controller";
import { adminMiddleware } from "../middleware/admin.middleware";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

export default router;
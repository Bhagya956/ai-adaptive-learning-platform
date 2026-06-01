import express from "express";
import {
  registerUser,
  loginUser,
} from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected profile route accessed",
    });
  }
);


export default router;
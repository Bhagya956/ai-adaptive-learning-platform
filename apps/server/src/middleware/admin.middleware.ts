import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const adminMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
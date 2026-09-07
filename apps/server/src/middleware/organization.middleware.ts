import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const organizationMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "organization") {
      return res.status(403).json({ message: "Access denied. Organization only." });
    }

    // Organizations registered through public signup are always active,
    // but guard here for consistency.
    const status = (user as any).accountStatus ?? "active";
    if (status === "pending") {
      return res.status(403).json({
        message: "Your account is pending approval.",
        accountStatus: "pending",
      });
    }
    if (status === "rejected") {
      return res.status(403).json({
        message: "Your account request was rejected.",
        accountStatus: "rejected",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

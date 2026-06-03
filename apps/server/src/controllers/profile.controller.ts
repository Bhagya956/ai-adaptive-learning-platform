import { Request, Response } from "express";

import User from "../models/User";

export const getProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,
        req.body,
        {
          new: true,
        }
      ).select("-password");

    res.status(200).json({
      message:
        "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
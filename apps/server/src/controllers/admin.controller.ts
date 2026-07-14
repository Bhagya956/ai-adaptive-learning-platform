import User from "../models/User";
import { Response } from "express";

export const getAllUsers = async (
  req: any,
  res: Response
) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

    return res.status(200).json(
      users
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch users",
    });
  }
};


export const getUserById = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json(
      user
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch user",
    });
  }
};


export const deleteUser = async (
  req: any,
  res: Response
) => {
  try {
    const user =
      await User.findByIdAndDelete(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      message:
        "User deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete user",
    });
  }
};
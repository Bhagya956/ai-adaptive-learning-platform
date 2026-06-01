import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // create new user
   // hash password
const hashedPassword = await bcrypt.hash(password, 10);

// create user
const user = await User.create({
  name,
  email,
  password: hashedPassword,
});

    // res.status(201).json({
    //   message: "User registered successfully",
    //   user,
    // });
    const userResponse = {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
};

res.status(201).json({
  message: "User registered successfully",
  user: userResponse,
});
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    // check user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // compare passwords
    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    // res.status(200).json({
    //   message: "Login successful",
    //   token,
    //   user,
    // });
const userResponse = {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
};

res.status(200).json({
  message: "Login successful",
  token,
  user: userResponse,
});
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
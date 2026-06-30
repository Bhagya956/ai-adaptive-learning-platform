import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(
      "AUTH HEADER:",
      req.headers.authorization
    );

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    console.log(
      "JWT SECRET:",
      process.env.JWT_SECRET
    );

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    console.log(
      "DECODED TOKEN:",
      decoded
    );

    req.user = decoded;

    next();
  } catch (error: any) {
    console.log(
      "JWT ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid token",
      error: error.message,
    });
  }
};

export default authMiddleware;
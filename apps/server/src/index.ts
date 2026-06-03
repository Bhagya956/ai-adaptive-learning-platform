import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import aiRoutes from "./routes/ai.routes";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(
  "/api/profile",
  profileRoutes
);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
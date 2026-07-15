import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import aiRoutes from "./routes/ai.routes";
import resumeRoutes from "./routes/resume.routes";
import adminRoutes from "./routes/admin.routes";
import skillGapRoutes
from "./routes/skillgap.routes";
import interviewRoutes
from "./routes/interview.routes";
import dashboardRoutes
from "./routes/dashboard.routes";
import learningRoutes
from "./routes/learning.routes";
import jobReadinessRoutes
from "./routes/jobreadiness.routes";
import adminAnalyticsRoutes
from "./routes/adminanalytics.routes";
import quizRoutes
from "./routes/quiz.routes";

import projectRecommendationRoutes
from "./routes/projectRecommendation.routes";
import portfolioAnalyzerRoutes
from "./routes/portfolioAnalyzer.routes";


dotenv.config();

console.log(
  "Gemini Key Loaded:",
  process.env.GEMINI_API_KEY
    ? "YES"
    : "NO"
);

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
app.use("/api/resume", resumeRoutes);
app.use(
  "/api/admin",
  adminRoutes
);
app.use(
  "/api/skill-gap",
  skillGapRoutes
);
app.use(
  "/api/interview-prep",
  interviewRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/learning",
  learningRoutes
);

app.use(
  "/api/job-readiness",
  jobReadinessRoutes
);
app.use(
  "/api/admin-analytics",
  adminAnalyticsRoutes
);

app.use(
  "/api/quiz",
  quizRoutes
);

app.use(
  "/api/project-recommendation",
  projectRecommendationRoutes
);

app.use(
  "/api/project-recommendation",
  projectRecommendationRoutes
);

app.use(
  "/api/portfolio-analyzer",
  portfolioAnalyzerRoutes
);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
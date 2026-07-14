"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function AdminAnalyticsPage() {
  const [stats, setStats] =
    useState<any>(null);

  const [skills, setSkills] =
    useState<any[]>([]);

  const [goals, setGoals] =
    useState<any[]>([]);

  const [growth, setGrowth] =
    useState<any>({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics =
    async () => {
      try {

        const statsRes =
          await api.get(
            "/admin-analytics"
          );

        const skillsRes =
          await api.get(
            "/admin-analytics/skills"
          );

        const goalsRes =
          await api.get(
            "/admin-analytics/career-goals"
          );

        const growthRes =
          await api.get(
            "/admin-analytics/user-growth"
          );

        setStats(
          statsRes.data
        );

        setSkills(
          skillsRes.data
        );

        setGoals(
          goalsRes.data
        );

        setGrowth(
          growthRes.data
        );

      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Admin Analytics
      </h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-10">

          <div className="border p-4 rounded">
            Users
            <h2 className="text-3xl font-bold">
              {stats.totalUsers}
            </h2>
          </div>

          <div className="border p-4 rounded">
            Roadmaps
            <h2 className="text-3xl font-bold">
              {stats.totalRoadmaps}
            </h2>
          </div>

          <div className="border p-4 rounded">
            Resume Analyses
            <h2 className="text-3xl font-bold">
              {stats.totalResumeAnalyses}
            </h2>
          </div>

          <div className="border p-4 rounded">
            Skill Gaps
            <h2 className="text-3xl font-bold">
              {stats.totalSkillGapAnalyses}
            </h2>
          </div>

          <div className="border p-4 rounded">
            Interviews
            <h2 className="text-3xl font-bold">
              {
                stats.totalInterviewPreparations
              }
            </h2>
          </div>

          <div className="border p-4 rounded">
            Learning Tasks
            <h2 className="text-3xl font-bold">
              {stats.totalLearningTasks}
            </h2>
          </div>

        </div>
      )}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Popular Skills
        </h2>

        {skills.map(
          (item, index) => (
            <div
              key={index}
              className="border p-3 mb-2 rounded"
            >
              {item[0]} — {item[1]}
            </div>
          )
        )}

      </div>

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-4">
          Popular Career Goals
        </h2>

        {goals.map(
          (item, index) => (
            <div
              key={index}
              className="border p-3 mb-2 rounded"
            >
              {item[0]} — {item[1]}
            </div>
          )
        )}

      </div>

      <div>

        <h2 className="text-2xl font-bold mb-4">
          User Growth
        </h2>

        {Object.entries(
          growth
        ).map(
          (
            [month, count]: any
          ) => (
            <div
              key={month}
              className="border p-3 mb-2 rounded"
            >
              {month} — {count}
            </div>
          )
        )}

      </div>

    </div>
  );
}
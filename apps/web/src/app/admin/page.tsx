"use client";

import { useEffect, useState } from "react";

import api from "@/src/services/api";

export default function AdminPage() {
  const [analytics, setAnalytics] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics =
    async () => {
      try {
        const token =
          JSON.parse(
            localStorage.getItem(
              "auth-storage"
            ) || "{}"
          )?.state?.token;

        const response =
          await api.get(
            "/admin-analytics",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setAnalytics(
          response.data
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Total Users
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalUsers
            }
          </p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Roadmaps Generated
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalRoadmaps
            }
          </p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Resume Analyses
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalResumeAnalyses
            }
          </p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Skill Gap Analyses
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalSkillGapAnalyses
            }
          </p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Interview Guides
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalInterviewPreparations
            }
          </p>
        </div>

        <div className="border rounded p-6">
          <h2 className="font-bold">
            Learning Tasks
          </h2>

          <p className="text-4xl mt-3">
            {
              analytics?.totalLearningTasks
            }
          </p>
        </div>

      </div>

    </div>
  );
}
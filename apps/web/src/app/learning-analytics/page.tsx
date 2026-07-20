"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function LearningAnalyticsPage() {

  const [analytics, setAnalytics] =
    useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics =
    async () => {

      try {

        const response =
          await api.get(
            "/learning-analytics"
          );

        setAnalytics(
          response.data
        );

      } catch (error) {

        console.error(error);

      }
    };

  if (!analytics) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Learning Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="border rounded p-4">
          <h2>Total Tasks</h2>
          <p className="text-3xl font-bold">
            {analytics.totalTasks}
          </p>
        </div>

        <div className="border rounded p-4">
          <h2>Completed</h2>
          <p className="text-3xl font-bold">
            {analytics.completedTasks}
          </p>
        </div>

        <div className="border rounded p-4">
          <h2>Pending</h2>
          <p className="text-3xl font-bold">
            {analytics.pendingTasks}
          </p>
        </div>

        <div className="border rounded p-4">
          <h2>Completion Rate</h2>
          <p className="text-3xl font-bold">
            {analytics.completionRate}%
          </p>
        </div>

      </div>

      <div className="border rounded p-6 mb-8">

        <h2 className="text-xl font-bold mb-2">
          Learning Insight
        </h2>

        <p>
          {analytics.insight}
        </p>

      </div>

      <div>

        <h2 className="text-xl font-bold mb-4">
          Recently Completed Tasks
        </h2>

        <div className="space-y-3">

          {analytics.recentCompleted?.map(
            (task: any) => (
              <div
                key={task._id}
                className="border rounded p-4"
              >

                <p className="font-semibold">
                  {task.title}
                </p>

                <p className="text-sm text-gray-500">
                  {task.completedAt
                    ? new Date(
                        task.completedAt
                      ).toLocaleString()
                    : "N/A"}
                </p>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}
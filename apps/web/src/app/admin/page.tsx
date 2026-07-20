"use client";

import { useEffect, useState } from "react";

import api from "@/src/services/api";

export default function AdminPage() {
  const [analytics, setAnalytics] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

    const [skills, setSkills] =
  useState<any[]>([]);

const [careerGoals, setCareerGoals] =
  useState<any[]>([]);

const [userGrowth, setUserGrowth] =
  useState<any>({});

const [activityAnalytics, setActivityAnalytics] =
  useState<any[]>([]);

useEffect(() => {
  fetchAnalytics();
  fetchSkills();
  fetchCareerGoals();
  fetchUserGrowth();
  fetchActivityAnalytics();
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

    const getToken = () =>
  JSON.parse(
    localStorage.getItem(
      "auth-storage"
    ) || "{}"
  )?.state?.token;

  const fetchSkills =
  async () => {
    try {
      const response =
        await api.get(
          "/admin-analytics/skills",
          {
            headers: {
              Authorization:
                `Bearer ${getToken()}`,
            },
          }
        );

      setSkills(
        response.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCareerGoals =
  async () => {
    try {
      const response =
        await api.get(
          "/admin-analytics/career-goals",
          {
            headers: {
              Authorization:
                `Bearer ${getToken()}`,
            },
          }
        );

      setCareerGoals(
        response.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserGrowth =
  async () => {
    try {
      const response =
        await api.get(
          "/admin-analytics/user-growth",
          {
            headers: {
              Authorization:
                `Bearer ${getToken()}`,
            },
          }
        );

      setUserGrowth(
        response.data
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivityAnalytics =
  async () => {
    try {
      const response =
        await api.get(
          "/admin-analytics/activity-analytics",
          {
            headers: {
              Authorization:
                `Bearer ${getToken()}`,
            },
          }
        );
        console.log(
  "ACTIVITY ANALYTICS:",
  response.data
);

      setActivityAnalytics(
        response.data
      );
    } catch (error) {
      console.error(error);
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

        <div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Popular Skills
  </h2>

  {skills.map((skill: any) => (
    <div
      key={skill[0]}
      className="border p-3 mb-2 rounded"
    >
      {skill[0]} — {skill[1]}
    </div>
  ))}

</div>

<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Popular Career Goals
  </h2>

  {careerGoals.map((goal: any) => (
    <div
      key={goal[0]}
      className="border p-3 mb-2 rounded"
    >
      {goal[0]} — {goal[1]}
    </div>
  ))}

</div>


<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    User Growth
  </h2>

  {Object.entries(
    userGrowth
  ).map(
    ([month, count]: any) => (
      <div
        key={month}
        className="border p-3 mb-2 rounded"
      >
        {month} — {count}
      </div>
    )
  )}

</div>


<div className="mt-10">

  <h2 className="text-2xl font-bold mb-4">
    Activity Analytics
  </h2>

{Object.entries(
  activityAnalytics || {}
).map(
  ([activity, count]: any) => (
    <div
      key={activity}
      className="border p-3 mb-2 rounded"
    >
      {activity} — {count}
    </div>
  )
)}

</div>

      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
// import { getDashboardStats } from "@/lib/dashboard";
import { getDashboardStats } from "@/src/lib/dashboard";


export default function DashboardPage() {
  const [stats, setStats] =
    useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data =
        await getDashboardStats();

      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4">

        <div className="border rounded-lg p-4">
          <h2>Roadmaps</h2>
          <p className="text-2xl">
            {stats.roadmaps}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2>Resumes</h2>
          <p className="text-2xl">
            {stats.resumes}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2>Skill Gaps</h2>
          <p className="text-2xl">
            {stats.skillGaps}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h2>Interviews</h2>
          <p className="text-2xl">
            {stats.interviews}
          </p>
        </div>

      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function JobReadinessPage() {
  const [data, setData] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchScore();
  }, []);

  const fetchScore = async () => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          "auth-storage"
        ) || "{}"
      )?.state?.token;

      const response =
        await api.get(
          "/job-readiness",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setData(response.data);
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
      <h1 className="text-3xl font-bold mb-6">
        Job Readiness Score
      </h1>

      <div className="border rounded p-6 mb-6">
        <h2 className="text-xl font-bold">
          Overall Score
        </h2>

        <p className="text-5xl font-bold text-green-600 mt-4">
          {
            data?.jobReadinessScore
          }
          /100
        </p>
      </div>

      <div className="border rounded p-6">
        <h2 className="text-xl font-bold mb-4">
          Score Breakdown
        </h2>

        <div className="space-y-3">
          <p>
            Profile Score:
            {" "}
            {
              data?.breakdown
                ?.profileScore
            }
          </p>

          <p>
            Learning Score:
            {" "}
            {
              data?.breakdown
                ?.learningScore
            }
          </p>

          <p>
            Resume Score:
            {" "}
            {
              data?.breakdown
                ?.resumeScore
            }
          </p>

          <p>
            Skill Gap Score:
            {" "}
            {
              data?.breakdown
                ?.skillGapScore
            }
          </p>
        </div>
      </div>
    </div>
  );
}
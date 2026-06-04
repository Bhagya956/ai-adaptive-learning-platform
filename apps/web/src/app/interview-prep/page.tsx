"use client";

import { useState } from "react";
import api from "@/src/services/api";

export default function InterviewPrepPage() {
  const [targetRole, setTargetRole] =
    useState("");

  const [guide, setGuide] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const generateGuide = async () => {
    try {
      setLoading(true);

       const token = JSON.parse(
      localStorage.getItem("auth-storage") || "{}"
    )?.state?.token;

      const response = await api.post(
        "/interview-prep",
        {
          targetRole,
        },
         {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGuide(response.data.guide);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Interview Preparation
      </h1>

      <input
        type="text"
        placeholder="Target Role"
        value={targetRole}
        onChange={(e) =>
          setTargetRole(e.target.value)
        }
        className="border p-3 w-full rounded"
      />

      <button
        onClick={generateGuide}
        className="bg-green-600 text-white px-5 py-2 rounded mt-4"
      >
        {loading
          ? "Generating..."
          : "Generate Interview Guide"}
      </button>

      {guide && (
        <div className="mt-8 border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">
            Interview Guide
          </h2>

          <pre className="whitespace-pre-wrap">
            {guide}
          </pre>
        </div>
      )}
    </div>
  );
}
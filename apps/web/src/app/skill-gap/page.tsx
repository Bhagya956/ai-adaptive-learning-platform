"use client";

import { useState } from "react";
import api from "@/src/services/api";

export default function SkillGapPage() {
  const [targetRole, setTargetRole] =
    useState("");

  const [analysis, setAnalysis] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const generateAnalysis = async () => {
    try {
      setLoading(true);

       const token = JSON.parse(
      localStorage.getItem("auth-storage") || "{}"
    )?.state?.token;

      const response = await api.post(
        "/skill-gap",
        {
          targetRole,
        },
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(
        response.data.analysis
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Skill Gap Analyzer
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
        onClick={generateAnalysis}
        className="bg-blue-600 text-white px-5 py-2 rounded mt-4"
      >
        {loading
          ? "Generating..."
          : "Analyze Skills"}
      </button>

      {analysis && (
        <div className="mt-8 border rounded p-4">
          <h2 className="text-xl font-semibold mb-3">
            Analysis Result
          </h2>

          <pre className="whitespace-pre-wrap">
            {analysis}
          </pre>
        </div>
      )}
    </div>
  );
}
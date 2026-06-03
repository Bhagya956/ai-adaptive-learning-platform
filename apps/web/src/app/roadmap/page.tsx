"use client";

import { useState } from "react";
import api from "@/src/services/api";

export default function RoadmapPage() {
  const [roadmap, setRoadmap] =
    useState("");

  const [loading, setLoading] =
    useState(false);

    const generateRoadmap = async () => {
  try {
    setLoading(true);

    const token = JSON.parse(
      localStorage.getItem("auth-storage") || "{}"
    )?.state?.token;

    const response =
      await api.post(
        "/ai/roadmap",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    setRoadmap(response.data.roadmap);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">
        AI Career Roadmap
      </h1>
      <button
  onClick={generateRoadmap}
  disabled={loading}
  className="bg-blue-500 text-white px-4 py-2 rounded mt-6"
>
  {loading
    ? "Generating..."
    : "Generate Roadmap"}
</button>

{roadmap && (
  <div className="mt-8 border p-4 rounded">
    <h2 className="text-xl font-bold mb-4">
      Generated Roadmap
    </h2>

    <pre className="whitespace-pre-wrap">
      {roadmap}
    </pre>
  </div>
)}
    </div>
  );
}
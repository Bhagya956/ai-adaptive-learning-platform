"use client";

import { useEffect, useState } from "react";

import { getRoadmapHistory }
from "@/src/lib/roadmap";

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] =
    useState<any[]>([]);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps =
    async () => {
      try {
        const data =
          await getRoadmapHistory();

        setRoadmaps(data);
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Roadmap History
      </h1>

      {roadmaps.length === 0 ? (
        <p>No roadmaps found.</p>
      ) : (
        <div className="space-y-6">
          {roadmaps.map(
            (roadmap) => (
              <div
                key={roadmap._id}
                className="border rounded-lg p-5"
              >
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(
                    roadmap.createdAt
                  ).toLocaleString()}
                </p>

                <pre className="whitespace-pre-wrap">
                  {roadmap.roadmap}
                </pre>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
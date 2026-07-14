"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function ProjectRecommendationPage() {
  const [loading, setLoading] = useState(false);
  const [latestRecommendation, setLatestRecommendation] =
    useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateRecommendations = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/project-recommendation"
      );

      setLatestRecommendation(response.data);

      fetchHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(
        "/project-recommendation/history"
      );

      setHistory(response.data);

      if (response.data.length > 0) {
        setLatestRecommendation(
          response.data[0]
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          AI Project Recommendations
        </h1>

        <button
          onClick={generateRecommendations}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Projects
        </button>
      </div>

      {loading && (
        <p>Generating project recommendations...</p>
      )}

      {latestRecommendation && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Latest Recommendations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestRecommendation.recommendations?.map(
              (
                project: any,
                index: number
              ) => (
                <div
                  key={index}
                  className="border rounded-lg p-5 shadow-sm"
                >
                  <h3 className="text-xl font-bold mb-2">
                    {project.title}
                  </h3>

                  <p className="mb-3 text-gray-600">
                    {project.description}
                  </p>

                  <p className="font-semibold">
                    Difficulty:{" "}
                    {project.difficulty}
                  </p>

                  <div className="mt-3">
                    <p className="font-semibold mb-2">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.skills?.map(
                        (
                          skill: string,
                          skillIndex: number
                        ) => (
                          <span
                            key={skillIndex}
                            className="bg-gray-200 px-2 py-1 rounded text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Recommendation History
        </h2>

        {history.map((item) => (
          <div
            key={item._id}
            className="border rounded p-4 mb-4"
          >
            <p>
              Career Goal: {item.careerGoal}
            </p>

            <p>
              Generated:{" "}
              {new Date(
                item.createdAt
              ).toLocaleString()}
            </p>

            <p>
              Projects:{" "}
              {
                item.recommendations
                  ?.length
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
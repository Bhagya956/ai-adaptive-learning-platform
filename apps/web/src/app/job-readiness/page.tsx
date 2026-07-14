"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function JobReadinessPage() {
  const [latestScore, setLatestScore] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateScore = async () => {
    try {
      setLoading(true);

      const token = JSON.parse(
        localStorage.getItem(
          "auth-storage"
        ) || "{}"
      )?.state?.token;

      const response =
        await api.post(
          "/job-readiness",
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setLatestScore(
        response.data
      );

      fetchHistory();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory =
    async () => {
      try {
        const token = JSON.parse(
          localStorage.getItem(
            "auth-storage"
          ) || "{}"
        )?.state?.token;

        const response =
          await api.get(
            "/job-readiness/history",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setHistory(
          response.data
        );

        if (
          response.data.length > 0
        ) {
          setLatestScore(
            response.data[0]
          );
        }

      } catch (error) {
        console.error(error);
      }
    };

  const getLevel = (
    score: number
  ) => {
    if (score >= 70)
      return "Job Ready";

    if (score >= 40)
      return "Intermediate";

    return "Beginner";
  };

  return (
    <div className="p-10">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Job Readiness Score
        </h1>

        <button
          onClick={generateScore}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate Score
        </button>

      </div>

      {loading && (
        <p>Generating...</p>
      )}

      {latestScore && (
        <div className="border rounded p-6 mb-8">

          <h2 className="text-xl font-bold mb-4">
            Latest Score
          </h2>

          <p className="text-5xl font-bold text-green-600">
            {latestScore.score}/100
          </p>

          <p className="mt-3 text-lg">
            Level:
            {" "}
            {getLevel(
              latestScore.score
            )}
          </p>

          <div className="mt-6">

            <h3 className="font-bold mb-2">
              Strengths
            </h3>

            <ul className="list-disc ml-6">
              {latestScore.strengths?.map(
                (
                  item: string,
                  index: number
                ) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

          </div>

          <div className="mt-6">

            <h3 className="font-bold mb-2">
              Weaknesses
            </h3>

            <ul className="list-disc ml-6">
              {latestScore.weaknesses?.map(
                (
                  item: string,
                  index: number
                ) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

          </div>

          <div className="mt-6">

            <h3 className="font-bold mb-2">
              Recommendations
            </h3>

            <ul className="list-disc ml-6">
              {latestScore.recommendations?.map(
                (
                  item: string,
                  index: number
                ) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}
            </ul>

          </div>

        </div>
      )}

      <div>

        <h2 className="text-2xl font-bold mb-4">
          History
        </h2>

        {history.map(
          (item) => (
            <div
              key={item._id}
              className="border rounded p-4 mb-3"
            >
              <p>
                Score:
                {" "}
                {item.score}/100
              </p>

              <p>
                Level:
                {" "}
                {getLevel(
                  item.score
                )}
              </p>

              <p>
                Date:
                {" "}
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </p>
            </div>
          )
        )}

      </div>

    </div>
  );
}
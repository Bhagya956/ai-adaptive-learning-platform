"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function PortfolioAnalyzerPage() {
  const [githubUsername, setGithubUsername] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [analysis, setAnalysis] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzePortfolio =
    async () => {
      try {
        setLoading(true);

        const token = JSON.parse(
          localStorage.getItem(
            "auth-storage"
          ) || "{}"
        )?.state?.token;

        const response =
          await api.post(
            "/portfolio-analyzer",
            {
              githubUsername,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setAnalysis(
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
            "/portfolio-analyzer/history",
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
          setAnalysis(
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
          Portfolio Analyzer
        </h1>

      </div>

      <div className="border rounded-lg p-6 mb-8">

        <h2 className="text-xl font-bold mb-4">
          Analyze GitHub Portfolio
        </h2>

        <input
          type="text"
          placeholder="GitHub Username"
          value={
            githubUsername
          }
          onChange={(e) =>
            setGithubUsername(
              e.target.value
            )
          }
          className="border p-2 rounded w-full mb-4"
        />

        <button
          onClick={
            analyzePortfolio
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Analyze Portfolio
        </button>

      </div>

      {loading && (
        <p>
          Analyzing portfolio...
        </p>
      )}

      {analysis && (
        <div className="space-y-6">

          <div className="border rounded-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              Portfolio Overview
            </h2>

            <p>
              <strong>
                GitHub Username:
              </strong>{" "}
              {
                analysis.githubUsername
              }
            </p>

            <p>
              <strong>
                Total Repositories:
              </strong>{" "}
              {
                analysis.totalRepos
              }
            </p>

          </div>

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-bold mb-4">
              Top Languages
            </h2>

            <div className="flex flex-wrap gap-2">

              {analysis.topLanguages?.map(
                (
                  language: string,
                  index: number
                ) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-3 py-1 rounded"
                  >
                    {language}
                  </span>
                )
              )}

            </div>

          </div>

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-bold mb-4">
              Strengths
            </h2>

            <ul className="list-disc ml-6 space-y-2">

              {analysis.strengths?.map(
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

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-bold mb-4">
              Weaknesses
            </h2>

            <ul className="list-disc ml-6 space-y-2">

              {analysis.weaknesses?.map(
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

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-bold mb-4">
              Recommendations
            </h2>

            <ul className="list-disc ml-6 space-y-2">

              {analysis.recommendations?.map(
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

          <div className="border rounded-lg p-6">

            <h2 className="text-xl font-bold mb-4">
              AI Portfolio Summary
            </h2>

            <p>
              {
                analysis.analysis
              }
            </p>

          </div>

        </div>
      )}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-4">
          Analysis History
        </h2>

        {history.map(
          (item) => (
            <div
              key={item._id}
              className="border rounded p-4 mb-3"
            >

              <p>
                GitHub:
                {" "}
                {
                  item.githubUsername
                }
              </p>

              <p>
                Repositories:
                {" "}
                {
                  item.totalRepos
                }
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
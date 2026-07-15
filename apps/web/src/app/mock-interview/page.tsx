"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import InterviewSection
from "@/src/components/InterviewSection";

export default function MockInterviewPage() {

  const [role, setRole] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [interview, setInterview] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateInterview =
    async () => {
      try {

        setLoading(true);

        const response =
          await api.post(
            "/mock-interview",
            {
              role,
            }
          );

        setInterview(
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

        const response =
          await api.get(
            "/mock-interview/history"
          );

        setHistory(
          response.data
        );

      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        AI Mock Interview
      </h1>

      <div className="border rounded p-6 mb-8">

        <h2 className="text-xl font-bold mb-4">
          Generate Interview
        </h2>

        <input
          type="text"
          placeholder="Frontend Developer"
          value={role}
          onChange={(e) =>
            setRole(
              e.target.value
            )
          }
          className="border p-2 rounded w-full mb-4"
        />

        <button
          onClick={
            generateInterview
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate
        </button>

      </div>

      {loading && (
        <p>
          Generating Interview...
        </p>
      )}

   {interview && (

  <InterviewSection
    interview={interview}
    refreshHistory={fetchHistory}
  />

)}

      <div>

        <h2 className="text-2xl font-bold mb-4">
          Interview History
        </h2>

        {history.map(
          (item) => (

            <div
              key={item._id}
              className="border rounded p-4 mb-4"
            >

              <p>
                Role:
                {" "}
                {item.role}
              </p>

              <p>
                Score:
                {" "}
                {item.score}
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
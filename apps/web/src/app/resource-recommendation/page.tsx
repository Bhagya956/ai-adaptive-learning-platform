"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function ResourceRecommendationPage() {
  const [skill, setSkill] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [latestResource, setLatestResource] =
    useState<any>(null);

  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateResources =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.post(
            "/resource-recommendation",
            {
              skill,
            }
          );

        setLatestResource(
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
            "/resource-recommendation/history"
          );

        setHistory(
          response.data
        );

        if (
          response.data.length > 0
        ) {
          setLatestResource(
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
          Learning Resource Recommendations
        </h1>

      </div>

      <div className="flex gap-4 mb-8">

        <input
          type="text"
          placeholder="Enter Skill (React, Node.js, MongoDB)"
          value={skill}
          onChange={(e) =>
            setSkill(
              e.target.value
            )
          }
          className="border p-2 rounded w-full"
        />

        <button
          onClick={
            generateResources
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Generate
        </button>

      </div>

      {loading && (
        <p>
          Generating resources...
        </p>
      )}

      {latestResource && (
        <div className="mb-10 border rounded-lg p-6">

          <h2 className="text-2xl font-bold mb-6">
            {latestResource.skill}
          </h2>

          <div className="mb-6">

            <h3 className="font-bold mb-2">
              Documentation
            </h3>

            <ul className="list-disc ml-6">
              {latestResource.documentation?.map(
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

          <div className="mb-6">

            <h3 className="font-bold mb-2">
              YouTube
            </h3>

            <ul className="list-disc ml-6">
              {latestResource.youtube?.map(
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

          <div className="mb-6">

            <h3 className="font-bold mb-2">
              Practice Platforms
            </h3>

            <ul className="list-disc ml-6">
              {latestResource.practicePlatforms?.map(
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

          <div className="mb-6">

            <h3 className="font-bold mb-2">
              Project Ideas
            </h3>

            <ul className="list-disc ml-6">
              {latestResource.projectIdeas?.map(
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

          <div>

            <h3 className="font-bold mb-2">
              Courses
            </h3>

            <ul className="list-disc ml-6">
              {latestResource.courses?.map(
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
              className="border rounded p-4 mb-4"
            >

              <p>
                Skill:
                {" "}
                {item.skill}
              </p>

              <p>
                Generated:
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
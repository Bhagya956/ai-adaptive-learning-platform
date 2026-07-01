"use client";

import { useEffect, useState } from "react";

import { getSkillGapHistory }
from "@/src/lib/skillgap";

export default function SkillGapHistoryPage() {
  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data =
        await getSkillGapHistory();

      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Skill Gap History
      </h1>

      {history.map((item) => (
        <div
          key={item._id}
          className="border rounded p-4 mb-4"
        >
          <h2 className="font-bold">
            Target Role:
            {" "}
            {item.targetRole}
          </h2>

          <p className="text-sm text-gray-500">
            {new Date(
              item.createdAt
            ).toLocaleString()}
          </p>

          <pre className="whitespace-pre-wrap mt-3">
            {item.analysis}
          </pre>
        </div>
      ))}
    </div>
  );
}

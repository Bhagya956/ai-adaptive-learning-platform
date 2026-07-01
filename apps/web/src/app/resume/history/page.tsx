"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";

export default function ResumeHistoryPage() {
  const [history, setHistory] =
    useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response =
        await api.get(
          "/resume/history"
        );

      setHistory(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Resume History
      </h1>

      {history.map((item) => (
        <div
          key={item._id}
          className="border rounded p-4 mb-4"
        >
          <p>
            <strong>Date:</strong>{" "}
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
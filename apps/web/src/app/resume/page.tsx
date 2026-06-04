"use client";

import { useState } from "react";
import axios from "axios";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error(error);
      alert("Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Resume Analyzer
      </h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
      >
        Analyze Resume
      </button>

      {loading && (
        <p className="mt-4">
          Analyzing Resume...
        </p>
      )}

      {analysis && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">
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
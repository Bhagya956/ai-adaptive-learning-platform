"use client";

import { useState } from "react";
import axios from "axios";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
const [analysis, setAnalysis] =
  useState<any>(null);
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

let raw =
  response.data.analysis;

raw = raw
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const parsedAnalysis =
  JSON.parse(raw);

setAnalysis(parsedAnalysis);
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
  <div className="mt-8 space-y-6">

    <div className="border rounded p-4">
      <h2 className="text-2xl font-bold">
        Resume Score
      </h2>

      <p className="text-4xl font-bold text-green-600">
        {analysis.score}/100
      </p>
    </div>

    <div className="border rounded p-4">
      <h2 className="font-bold text-xl mb-2">
        Strengths
      </h2>

      <ul className="list-disc ml-5">
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

    <div className="border rounded p-4">
      <h2 className="font-bold text-xl mb-2">
        Weaknesses
      </h2>

      <ul className="list-disc ml-5">
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

    <div className="border rounded p-4">
      <h2 className="font-bold text-xl mb-2">
        Missing Skills
      </h2>

      <ul className="list-disc ml-5">
        {analysis.missingSkills?.map(
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

    <div className="border rounded p-4">
      <h2 className="font-bold text-xl mb-2">
        Suggestions
      </h2>

      <ul className="list-disc ml-5">
        {analysis.suggestions?.map(
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

    <div className="border rounded p-4">
      <h2 className="font-bold text-xl mb-2">
        Recommended Roles
      </h2>

      <ul className="list-disc ml-5">
        {analysis.recommendedRoles?.map(
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
    </div>
  );
}
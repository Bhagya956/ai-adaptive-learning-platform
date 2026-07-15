"use client";

import { useState } from "react";
import api from "@/src/services/api";

export default function InterviewSection({
  interview,
  refreshHistory,
}: any) {

  const [answers, setAnswers] =
    useState<string[]>(
      Array(
        interview.questions.length
      ).fill("")
    );

  const [result, setResult] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const updateAnswer = (
    index: number,
    value: string
  ) => {

    const updated =
      [...answers];

    updated[index] = value;

    setAnswers(updated);
  };

  const submitInterview =
    async () => {

      try {

        setLoading(true);

        const response =
          await api.post(
            `/mock-interview/${interview._id}/submit`,
            {
              answers,
            }
          );

        setResult(
          response.data
        );

        refreshHistory();

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="border rounded p-6 mb-8">

      <h2 className="text-xl font-bold mb-6">
        Interview Questions
      </h2>

      {interview.questions.map(
        (
          question: string,
          index: number
        ) => (

          <div
            key={index}
            className="mb-6"
          >

            <p className="font-semibold mb-2">
              Q{index + 1}
            </p>

            <p className="mb-3">
              {question}
            </p>

            <textarea
              rows={4}
              value={
                answers[index]
              }
              onChange={(e) =>
                updateAnswer(
                  index,
                  e.target.value
                )
              }
              className="border w-full rounded p-2"
            />

          </div>

        )
      )}

      <button
        onClick={
          submitInterview
        }
        className="bg-green-600 text-white px-5 py-2 rounded"
      >
        Submit Interview
      </button>

      {loading && (
        <p className="mt-4">
          Evaluating...
        </p>
      )}

      {result && (

        <div className="mt-8 border-t pt-6">

          <h2 className="text-2xl font-bold mb-4">
            Result
          </h2>

          <p className="text-4xl font-bold text-green-600 mb-6">
            {result.score}/100
          </p>

          <div className="mb-6">

            <h3 className="font-bold mb-2">
              Strengths
            </h3>

            <ul className="list-disc ml-6">

              {result.strengths?.map(
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
              Weaknesses
            </h3>

            <ul className="list-disc ml-6">

              {result.weaknesses?.map(
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
              Feedback
            </h3>

            <ul className="list-disc ml-6">

              {result.feedback?.map(
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
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function QuizHistoryPage() {

  const [quizzes, setQuizzes] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchHistory();

  }, []);

  const fetchHistory =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await axios.get(
            "http://localhost:5000/api/quiz/history",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setQuizzes(
          response.data
        );

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }

    };

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Quiz History
      </h1>

      <div className="space-y-4">

        {quizzes.map(
          (quiz) => (

            <div
              key={quiz._id}
              className="border rounded p-4"
            >

              <h2 className="text-xl font-bold">
                {quiz.topic}
              </h2>

              <p>
                Score:
                {" "}
                {quiz.score}
                /
                {quiz.totalQuestions}
              </p>

              <p>
                Date:
                {" "}
                {new Date(
                  quiz.createdAt
                ).toLocaleDateString()}
              </p>

              <Link
  href={`/quiz/history/${quiz._id}`}
  className="text-blue-500"
>
  View Details
</Link>

            </div>

          )

          
        )}

        

      </div>

      

    </div>
  );
}
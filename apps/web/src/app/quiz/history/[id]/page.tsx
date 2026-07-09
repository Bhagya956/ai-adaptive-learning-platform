"use client";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";


import { useParams } from "next/navigation";

export default function QuizDetails() {

  const [quiz, setQuiz] =
    useState<any>(null);

    const params = useParams();

const quizId = params.id;

  useEffect(() => {

    fetchQuiz();

  }, []);

  const fetchQuiz =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

          console.log("Quiz ID:", quizId);
        const response =
          await axios.get(
            `http://localhost:5000/api/quiz/${quizId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setQuiz(
          response.data
        );

      } catch (error) {
        console.error(error);
      }

    };

  if (!quiz) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">
        {quiz.topic}
      </h1>

      <h2 className="text-xl mb-6">
        Score:
        {" "}
        {quiz.score}
        /
        {quiz.totalQuestions}
      </h2>

      {quiz.questions.map(
        (
          question: any,
          index: number
        ) => (

          <div
            key={question._id}
            className="border rounded p-4 mb-4"
          >

            <h3 className="font-bold mb-2">

              {index + 1}.
              {" "}
              {question.question}

            </h3>

            <p>
              Your Answer:
              {" "}

              {question.userAnswer ===
              question.correctAnswer
                ? "✅ "
                : "❌ "}

              {question.userAnswer}
            </p>

            <p className="text-green-600">

              Correct Answer:
              {" "}
              {
                question.correctAnswer
              }

            </p>

          </div>

        )
      )}

    </div>
  );
}
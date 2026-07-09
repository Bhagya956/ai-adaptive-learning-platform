"use client";

import { useState } from "react";
import axios from "axios";

export default function QuizPage() {

  const [topic, setTopic] =
    useState("");

  const [quiz, setQuiz] =
    useState<any>(null);

  const [answers, setAnswers] =
    useState<any>({});

  const [score, setScore] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const generateQuiz =
    async () => {
      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await axios.post(
            "http://localhost:5000/api/quiz",
            { topic },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setQuiz(response.data);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const handleAnswer =
    (
      questionId: string,
      answer: string
    ) => {

      setAnswers({
        ...answers,
        [questionId]: answer,
      });

    };

  const submitQuiz =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const formattedAnswers =
          Object.keys(
            answers
          ).map(
            (questionId) => ({
              questionId,
              answer:
                answers[
                  questionId
                ],
            })
          );

        const response =
          await axios.put(
            `http://localhost:5000/api/quiz/${quiz._id}/submit`,
            {
              answers:
                formattedAnswers,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setScore(
          response.data
        );

      } catch (error) {
        console.error(error);
      }

    };

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Quiz Generator
      </h1>

      <div className="flex gap-3">

        <input
          type="text"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) =>
            setTopic(
              e.target.value
            )
          }
          className="border p-2 rounded"
        />

        <button
          onClick={generateQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Generate Quiz
        </button>

      </div>

      {loading && (
        <p className="mt-4">
          Generating...
        </p>
      )}

      {quiz && (

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-6">
            {quiz.topic}
          </h2>

          {quiz.questions.map(
            (
              question: any,
              index: number
            ) => (

              <div
                key={
                  question._id
                }
                className="border rounded p-4 mb-4"
              >

                <h3 className="font-bold mb-3">

                  {index + 1}.
                  {" "}
                  {
                    question.question
                  }

                </h3>

                {question.options.map(
                  (
                    option: string,
                    optionIndex: number
                  ) => (

                    <label
                      key={
                        optionIndex
                      }
                      className="block"
                    >

                      <input
                        type="radio"
                        name={
                          question._id
                        }
                        value={
                          option
                        }
                        onChange={() =>
                          handleAnswer(
                            question._id,
                            option
                          )
                        }
                      />

                      {" "}
                      {option}

                    </label>

                  )
                )}

              </div>

            )
          )}

          <button
            onClick={submitQuiz}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            Submit Quiz
          </button>

        </div>

      )}

      {score && (

        <div className="mt-8 border rounded p-6">

          <h2 className="text-2xl font-bold">
            Score
          </h2>

          <p className="text-4xl mt-3">

            {score.score}
            /
            {
              score.totalQuestions
            }

          </p>

        </div>

      )}

    </div>
  );
}
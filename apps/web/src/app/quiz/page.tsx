"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Sparkles, Clock, CheckCircle2, XCircle, Trophy } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";

type QuizState = "idle" | "generated" | "submitted";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<any>(null);
  const [state, setState] = useState<QuizState>("idle");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast.warning("Topic required", "Enter a topic to generate a quiz.");
      return;
    }
    setGenerating(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/quiz", { topic }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuiz(response.data);
      setAnswers({});
      setScore(null);
      setState("generated");
      toast.success("Quiz ready!", `${response.data.questions?.length} questions generated.`);
    } catch {
      toast.error("Generation failed", "Could not generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    const unanswered = quiz.questions.filter((q: any) => !answers[q._id]);
    if (unanswered.length > 0) {
      toast.warning("Incomplete quiz", `You have ${unanswered.length} unanswered question(s).`);
      return;
    }
    setSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        answer: answers[questionId],
      }));
      const response = await api.put(
        `/quiz/${quiz._id}/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScore(response.data);
      setState("submitted");
    } catch {
      toast.error("Submit failed", "Could not submit your quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = quiz?.questions?.length ?? 0;
  const pct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const scorePercent =
    score && score.totalQuestions > 0
      ? Math.round((score.score / score.totalQuestions) * 100)
      : 0;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={22} className="text-amber-500" />
            AI Quiz Generator
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Generate a multiple-choice quiz on any topic and test your knowledge
          </p>
        </div>
        <Link href="/quiz/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      {/* Topic input */}
      <Card>
        <CardHeader><CardTitle>Quiz Topic</CardTitle></CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. React Hooks, Python Decorators, Machine Learning"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
              leftIcon={<Zap size={14} />}
            />
          </div>
          <Button onClick={generateQuiz} loading={generating} leftIcon={<Sparkles size={14} />}>
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* Score result */}
      {state === "submitted" && score && (
        <Card className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-amber-500" />
          </div>
          <p className="text-5xl font-bold text-text-primary tabular-nums mb-1">
            {score.score}/{score.totalQuestions}
          </p>
          <p className="text-text-secondary text-sm mb-4">{scorePercent}% correct</p>
          <div className="max-w-xs mx-auto mb-6">
            <ProgressBar
              value={scorePercent}
              color={scorePercent >= 70 ? "success" : scorePercent >= 40 ? "warning" : "danger"}
              size="lg"
              showLabel
            />
          </div>
          <Badge
            variant={scorePercent >= 70 ? "success" : scorePercent >= 40 ? "warning" : "danger"}
          >
            {scorePercent >= 70 ? "Excellent!" : scorePercent >= 40 ? "Good effort" : "Keep practicing"}
          </Badge>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => { setState("idle"); setQuiz(null); setTopic(""); }}
            >
              New Quiz
            </Button>
            <Link href="/quiz/history">
              <Button variant="secondary">View History</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Loading skeleton */}
      {generating && (
        <Card className="py-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
            <p className="text-sm text-text-secondary">Generating your quiz…</p>
          </div>
        </Card>
      )}

      {/* Quiz questions */}
      {quiz && state === "generated" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="brand">{quiz.topic}</Badge>
            <span className="text-xs text-text-muted">
              {answeredCount}/{totalCount} answered
            </span>
          </div>

          {totalCount > 0 && (
            <ProgressBar value={answeredCount} max={totalCount} color="brand" size="sm" />
          )}

          {quiz.questions.map((question: any, index: number) => (
            <Card key={question._id}>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="font-medium text-text-primary text-sm leading-relaxed">
                  {question.question}
                </p>
              </div>
              <div className="space-y-2 ml-10">
                {question.options.map((option: string, oi: number) => {
                  const isSelected = answers[question._id] === option;
                  return (
                    <label
                      key={oi}
                      className={[
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border hover:border-brand-300 hover:bg-surface-3",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswer(question._id, option)}
                        className="sr-only"
                      />
                      <div
                        className={[
                          "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                          isSelected ? "border-brand-600" : "border-slate-300",
                        ].join(" ")}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-text-secondary">
              {answeredCount < totalCount
                ? `${totalCount - answeredCount} question(s) remaining`
                : "All questions answered"}
            </p>
            <Button
              onClick={submitQuiz}
              loading={submitting}
              leftIcon={<CheckCircle2 size={14} />}
              disabled={answeredCount === 0}
            >
              Submit Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Idle empty state */}
      {state === "idle" && !generating && (
        <Card className="text-center py-14">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Zap size={32} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to test your knowledge?</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter any topic above to generate a multiple-choice quiz instantly.
          </p>
        </Card>
      )}
    </div>
  );
}

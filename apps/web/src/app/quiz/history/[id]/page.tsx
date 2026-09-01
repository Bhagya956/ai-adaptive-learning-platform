"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Zap, ArrowLeft, CheckCircle2, XCircle, Trophy } from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;
    const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
    api
      .get(`/quiz/${quizId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setQuiz(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <PageLoader message="Loading quiz details…" />;
  if (!quiz) return (
    <div className="text-center py-20">
      <p className="text-text-secondary">Quiz not found.</p>
      <Link href="/quiz/history">
        <Button variant="secondary" className="mt-4">Back to History</Button>
      </Link>
    </div>
  );

  const pct =
    quiz.totalQuestions > 0
      ? Math.round((quiz.score / quiz.totalQuestions) * 100)
      : 0;
  const color = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quiz/history">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            {quiz.topic}
          </h1>
          <p className="text-text-secondary text-sm">Quiz results and answer review</p>
        </div>
      </div>

      {/* Score summary */}
      <Card className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Trophy size={28} className="text-amber-500" />
        </div>
        <p className="text-4xl font-bold text-text-primary tabular-nums mb-1">
          {quiz.score}/{quiz.totalQuestions}
        </p>
        <p className="text-text-secondary text-sm mb-4">{pct}% correct</p>
        <div className="max-w-xs mx-auto mb-4">
          <ProgressBar value={pct} color={color as any} size="md" showLabel />
        </div>
        <Badge variant={color as any}>
          {pct >= 70 ? "Excellent!" : pct >= 40 ? "Good effort" : "Keep practicing"}
        </Badge>
      </Card>

      {/* Questions */}
      <div className="space-y-3">
        <h2 className="font-semibold text-text-primary text-sm uppercase tracking-wide text-text-muted">
          Question Review
        </h2>
        {quiz.questions?.map((question: any, index: number) => {
          const isCorrect = question.userAnswer === question.correctAnswer;
          return (
            <Card
              key={question._id}
              className={`border-l-4 ${isCorrect ? "border-l-success" : "border-l-danger"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
                )}
                <p className="font-medium text-sm text-text-primary leading-relaxed">
                  <span className="text-text-muted mr-1">{index + 1}.</span>
                  {question.question}
                </p>
              </div>

              <div className="ml-7 space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${isCorrect ? "text-success" : "text-danger"}`}>
                  <span className="font-medium">Your answer:</span>
                  <span>{question.userAnswer || "—"}</span>
                </div>
                {!isCorrect && (
                  <div className="flex items-center gap-2 text-success">
                    <span className="font-medium">Correct answer:</span>
                    <span>{question.correctAnswer}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 pt-2">
        <Link href="/quiz">
          <Button variant="primary">Take Another Quiz</Button>
        </Link>
        <Link href="/quiz/history">
          <Button variant="secondary">All History</Button>
        </Link>
      </div>
    </div>
  );
}

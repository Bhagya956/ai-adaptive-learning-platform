"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, Calendar, Trophy } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function QuizHistoryPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
    api
      .get("/quiz/history", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setQuizzes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading quiz history…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/quiz">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            Quiz History
          </h1>
          <p className="text-text-secondary text-sm">All your completed quizzes and scores</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No quizzes yet"
          description="Take your first AI-generated quiz to see results here."
          action={{ label: "Take a Quiz", onClick: () => window.location.href = "/quiz" }}
        />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz: any) => {
            const pct =
              quiz.totalQuestions > 0
                ? Math.round((quiz.score / quiz.totalQuestions) * 100)
                : 0;
            const color =
              pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";

            return (
              <Card key={quiz._id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Trophy size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="font-semibold text-text-primary">{quiz.topic}</h2>
                      <Badge
                        variant={color as any}
                        size="sm"
                        className="shrink-0"
                      >
                        {quiz.score}/{quiz.totalQuestions}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <ProgressBar value={pct} color={color as any} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Calendar size={11} />
                        {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </div>
                      <Link
                        href={`/quiz/history/${quiz._id}`}
                        className="text-xs text-brand-600 font-medium hover:text-brand-700 transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

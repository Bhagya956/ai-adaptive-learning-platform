"use client";

import { useEffect, useState } from "react";
import { Briefcase, Sparkles, CheckCircle, AlertCircle, Lightbulb, History } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

function getLevel(score: number) {
  if (score >= 70) return { label: "Job Ready", variant: "success" as const, color: "text-success" };
  if (score >= 40) return { label: "Intermediate", variant: "warning" as const, color: "text-warning" };
  return { label: "Beginner", variant: "danger" as const, color: "text-danger" };
}

function ScoreDisplay({ score }: { score: number }) {
  const level = getLevel(score);
  const barColor = score >= 70 ? "success" : score >= 40 ? "warning" : "danger";

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444"}
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${level.color}`}>{score}</span>
          <span className="text-xs text-text-muted">/100</span>
        </div>
      </div>
      <Badge variant={level.variant} size="md">{level.label}</Badge>
      <div className="w-full max-w-xs">
        <ProgressBar value={score} color={barColor} size="md" showLabel />
      </div>
    </div>
  );
}

export default function JobReadinessPage() {
  const [latestScore, setLatestScore] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.get("/job-readiness/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
      if (response.data.length > 0) setLatestScore(response.data[0]);
    } catch {
      toast.error("Load failed", "Could not load job readiness history.");
    } finally {
      setLoading(false);
    }
  };

  const generateScore = async () => {
    setGenerating(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/job-readiness", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLatestScore(response.data);
      fetchHistory();
      toast.success("Score generated!", "Your job readiness has been assessed.");
    } catch {
      toast.error("Generation failed", "Could not generate your score.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <PageLoader message="Loading job readiness…" />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Briefcase size={22} className="text-violet-600" />
            Job Readiness Score
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            AI evaluates your profile, skills, and activity to score your career readiness
          </p>
        </div>
        {/* <Button onClick={generateScore} loading={generating} leftIcon={<Sparkles size={14} />}>
          {generating ? "Analyzing…" : "Generate Score"}
        </Button> */}
      </div>

      {/* Latest score */}
      {latestScore ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1 flex flex-col items-center">
            <CardHeader className="w-full">
              <CardTitle>Your Score</CardTitle>
            </CardHeader>
            <ScoreDisplay score={latestScore.score} />
          </Card>

          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {latestScore.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-warning" />
                  <CardTitle>Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {latestScore.weaknesses?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" />
                  <CardTitle>Recommendations</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {latestScore.recommendations?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
            <Briefcase size={32} className="text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No score yet</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
            Generate your first job readiness score to see how prepared you are for the job market.
          </p>
          <Button onClick={generateScore} loading={generating} leftIcon={<Sparkles size={14} />}>
            Generate My Score
          </Button>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History size={16} className="text-text-muted" />
              <CardTitle>Score History</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-2">
            {history.map((item: any) => {
              const level = getLevel(item.score);
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold tabular-nums ${level.color}`}>
                      {item.score}
                    </span>
                    <Badge variant={level.variant} size="sm">{level.label}</Badge>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

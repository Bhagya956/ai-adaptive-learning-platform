"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Users, BookOpen, Zap, Activity,
  CheckCircle2, Clock, Trophy, Target,
} from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import ProgressBar from "@/src/components/ui/ProgressBar";
import StatCard from "@/src/components/ui/StatCard";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface LearnerDetail {
  learner: {
    _id: string;
    name: string;
    email: string;
    currentRole: string;
    careerGoal: string;
    skills: string[];
    education: string;
    experience: number;
    createdAt: string;
  };
  progress: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalQuizzes: number;
    avgQuizScore: number;
  };
  learningTasks: Array<{
    _id: string;
    title: string;
    description: string;
    status: "pending" | "completed";
    completedAt: string | null;
    createdAt: string;
  }>;
  quizHistory: Array<{
    _id: string;
    topic: string;
    score: number;
    totalQuestions: number;
    createdAt: string;
  }>;
  activityTimeline: Array<{
    _id: string;
    activityType: string;
    description: string;
    createdAt: string;
  }>;
}

export default function LearnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<LearnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/educator/learners/${id}`)
      .then((r) => setData(r.data))
      .catch((e) => {
        setError(e?.response?.data?.message ?? "Failed to load learner.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader message="Loading learner profile…" />;
  if (error || !data) {
    const is403 = error?.includes("not assigned");
    return (
      <div className="max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.back()}>
          Back
        </Button>
        <Card className={is403 ? "border-l-4 border-l-danger" : ""}>
          <p className="text-danger font-medium">{error || "Learner not found."}</p>
          {is403 && (
            <p className="text-sm text-text-secondary mt-1">
              You can only view learners assigned to you.
            </p>
          )}
        </Card>
      </div>
    );
  }

  const { learner, progress, learningTasks, quizHistory, activityTimeline } = data;
  const rateColor = progress.completionRate >= 70 ? "success" : progress.completionRate >= 40 ? "warning" : "danger";
  const initials = learner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.back()}>
        Back to Learners
      </Button>

      {/* Learner header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-text-primary">{learner.name}</h1>
              <Badge variant="default" size="sm">Student</Badge>
            </div>
            <p className="text-sm text-text-muted mb-2">{learner.email}</p>
            <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
              {learner.currentRole && <span>💼 {learner.currentRole}</span>}
              {learner.careerGoal && <span>🎯 {learner.careerGoal}</span>}
              {learner.education && <span>🎓 {learner.education}</span>}
              {learner.experience > 0 && <span>⏳ {learner.experience} yr{learner.experience !== 1 ? "s" : ""} exp</span>}
            </div>
            {learner.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {learner.skills.slice(0, 8).map((s) => (
                  <Badge key={s} variant="brand" size="sm">{s}</Badge>
                ))}
                {learner.skills.length > 8 && (
                  <Badge variant="default" size="sm">+{learner.skills.length - 8} more</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Progress stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completion Rate" value={`${progress.completionRate}%`} icon={Target}
          iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Tasks Done" value={`${progress.completedTasks}/${progress.totalTasks}`} icon={CheckCircle2}
          iconColor="text-success" iconBg="bg-success-bg" />
        <StatCard title="Quizzes Taken" value={progress.totalQuizzes} icon={Zap}
          iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatCard title="Avg Quiz Score" value={`${progress.avgQuizScore}%`} icon={Trophy}
          iconColor="text-brand-600" iconBg="bg-brand-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={15} className="text-brand-600" /> Learning Tasks
            </CardTitle>
            <div className="mt-2">
              <ProgressBar value={progress.completionRate} color={rateColor as any} size="sm" />
            </div>
          </CardHeader>
          {learningTasks.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No learning tasks yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {learningTasks.map((task) => (
                <div key={task._id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                  <div className={[
                    "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                    task.status === "completed" ? "border-success bg-success" : "border-slate-300",
                  ].join(" ")}>
                    {task.status === "completed" && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                      {task.title}
                    </p>
                    {task.completedAt && (
                      <p className="text-[10px] text-text-muted">
                        Completed {new Date(task.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quiz History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={15} className="text-amber-500" /> Quiz History
            </CardTitle>
          </CardHeader>
          {quizHistory.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No quizzes taken yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {quizHistory.map((quiz) => {
                const pct = quiz.totalQuestions > 0
                  ? Math.round((quiz.score / quiz.totalQuestions) * 100) : 0;
                const c = pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";
                return (
                  <div key={quiz._id} className="py-2 border-b border-border last:border-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-text-primary truncate">{quiz.topic}</p>
                      <Badge variant={c as any} size="sm">{quiz.score}/{quiz.totalQuestions}</Badge>
                    </div>
                    <ProgressBar value={pct} color={c as any} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Activity Timeline */}
      {activityTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={15} className="text-brand-600" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <div className="space-y-0">
            {activityTimeline.map((a, i) => (
              <div
                key={a._id}
                className={["flex items-center gap-3 py-2.5",
                  i < activityTimeline.length - 1 ? "border-b border-border" : ""].join(" ")}
              >
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Activity size={12} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary capitalize">
                    {a.activityType.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-text-muted truncate">{a.description}</p>
                </div>
                <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0">
                  <Clock size={10} />
                  {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

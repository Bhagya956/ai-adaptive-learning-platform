"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface TrackerEntry {
  learner: { _id: string; name: string; email: string };
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  recentTasks: Array<{
    _id: string;
    title: string;
    status: "pending" | "completed";
    completedAt: string | null;
    createdAt: string;
  }>;
}

export default function LearningTrackerPage() {
  const [tracker, setTracker] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/educator/learning-tracker")
      .then((r) => setTracker(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading learning tracker…" />;

  const total = tracker.reduce((s, e) => s + e.totalTasks, 0);
  const done = tracker.reduce((s, e) => s + e.completedTasks, 0);
  const overallRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BookOpen size={22} className="text-brand-600" />
          Learning Tracker
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Monitor learning task progress across your assigned learners
        </p>
      </div>

      {/* Summary row */}
      {tracker.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Learners</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{tracker.length}</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Total Tasks</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{total}</p>
          </div>
          <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Overall Completion</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{overallRate}%</p>
          </div>
        </div>
      )}

      {/* Per-learner cards */}
      {tracker.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assigned learners yet"
          description="Add learners from the My Learners page. Their task progress will appear here."
        />
      ) : (
        <div className="space-y-4">
          {tracker.map((entry) => {
            const color = entry.completionRate >= 70 ? "success"
              : entry.completionRate >= 40 ? "warning" : "danger";
            const initials = entry.learner.name
              .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

            return (
              <Card key={entry.learner._id}>
                {/* Learner row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-primary">{entry.learner.name}</p>
                      <Link
                        href={`/educator/learners/${entry.learner._id}`}
                        className="flex items-center gap-0.5 text-xs text-brand-600 hover:text-brand-700 shrink-0"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </div>
                    <p className="text-xs text-text-muted">{entry.learner.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={color as any} size="sm">
                      {entry.completedTasks}/{entry.totalTasks}
                    </Badge>
                    <span className="text-sm font-semibold text-text-primary w-10 text-right">
                      {entry.completionRate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar value={entry.completionRate} color={color as any} size="sm" />

                {/* Recent tasks */}
                {entry.recentTasks.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {entry.recentTasks.slice(0, 3).map((task) => (
                      <div key={task._id} className="flex items-center gap-2">
                        {task.status === "completed" ? (
                          <CheckCircle2 size={13} className="text-success shrink-0" />
                        ) : (
                          <Clock size={13} className="text-warning shrink-0" />
                        )}
                        <span className={[
                          "text-xs truncate",
                          task.status === "completed"
                            ? "text-text-muted line-through" : "text-text-secondary",
                        ].join(" ")}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

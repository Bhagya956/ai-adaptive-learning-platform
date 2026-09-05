"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, BookOpen, BarChart2, Activity, Zap,
  TrendingUp, CheckCircle2, Clock, Sparkles, ClipboardList,
} from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface DashboardData {
  totalLearners: number;
  activeLearners: number;
  totalLearningTasks: number;
  completedTasks: number;
  completionRate: number;
  totalQuizzes: number;
  avgQuizScore: number;
  recentActivity: Array<{
    _id: string;
    activityType: string;
    description: string;
    createdAt: string;
    userId: { name: string; email: string } | null;
  }>;
}

const quickLinks = [
  { label: "My Learners", href: "/educator/learners", icon: Users, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "Learning Tracker", href: "/educator/learning-tracker", icon: BookOpen, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { label: "Assessments", href: "/educator/assessments", icon: Zap, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "Create Assessment", href: "/educator/assessments/create", icon: ClipboardList, color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
  { label: "Analytics", href: "/educator/analytics", icon: BarChart2, color: "bg-brand-50 text-brand-600 hover:bg-brand-100" },
  { label: "Activity", href: "/educator/activity", icon: Activity, color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
];

function activityLabel(type: string) {
  return type?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Activity";
}

export default function EducatorDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    api.get("/educator/dashboard")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;

  // If the educator has no learners assigned yet, show a helpful prompt
  const hasLearners = data && data.totalLearners > 0;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Here's an overview of your assigned learners and their activity.
          </p>
        </div>
        <Badge variant="success" size="md">
          <Users size={12} className="mr-1.5" />
          Educator / Mentor
        </Badge>
      </div>

      {/* Stat cards */}
      {data && hasLearners && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Learners"
            value={data.totalLearners}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            href="/educator/learners"
          />
          <StatCard
            title="Active (30d)"
            value={data.activeLearners}
            icon={TrendingUp}
            iconColor="text-success"
            iconBg="bg-success-bg"
          />
          <StatCard
            title="Completion Rate"
            value={`${data.completionRate}%`}
            icon={CheckCircle2}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
          />
          <StatCard
            title="Avg Quiz Score"
            value={`${data.avgQuizScore}%`}
            icon={Zap}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
      )}

      {/* Secondary stat row */}
      {data && hasLearners && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Learning Tasks"
            value={data.totalLearningTasks}
            icon={BookOpen}
            iconColor="text-brand-600"
            iconBg="bg-brand-50"
          />
          <StatCard
            title="Completed Tasks"
            value={data.completedTasks}
            icon={CheckCircle2}
            iconColor="text-success"
            iconBg="bg-success-bg"
          />
          <StatCard
            title="Total Quizzes"
            value={data.totalQuizzes}
            icon={Zap}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
        </div>
      )}

      {/* No learners assigned yet — prompt the educator */}
      {data && !hasLearners && (
        <Card className="border-l-4 border-l-amber-400">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Users size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm">No learners assigned yet</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                Go to <strong>My Learners</strong> and use the <em>Add Learner</em> button to connect a student by their email address.
              </p>
              <Link href="/educator/learners" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
                Go to My Learners →
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Educator tools and views</p>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={[
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-150",
                a.color,
              ].join(" ")}
            >
              <a.icon size={18} className="shrink-0" />
              <span className="text-sm font-medium leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent activity */}
      {data && data.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Learner Activity</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Latest actions from your assigned learners</p>
          </CardHeader>
          <div className="space-y-0">
            {data.recentActivity.map((a, i) => (
              <div
                key={a._id}
                className={[
                  "flex items-center justify-between py-3 gap-4",
                  i < data.recentActivity.length - 1 ? "border-b border-border" : "",
                ].join(" ")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Activity size={14} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {activityLabel(a.activityType)}
                    </p>
                    <p className="text-xs text-text-muted truncate">{a.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.userId && (
                    <p className="text-xs font-medium text-text-secondary">{a.userId.name}</p>
                  )}
                  <p className="text-[10px] text-text-muted flex items-center gap-1 justify-end">
                    <Clock size={10} />
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Assistant promo */}
      <Card className="border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1 text-sm">AI Assistant</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Generate quiz questions, learning resources, and career guidance for your learners.
            </p>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open AI Assistant →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

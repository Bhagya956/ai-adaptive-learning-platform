"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, BookOpen, BarChart2, Activity, Zap, ClipboardList,
  TrendingUp, CheckCircle2, Clock, Sparkles, Plus,
} from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
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
    _id: string; activityType: string; description: string;
    createdAt: string; userId: { name: string; email: string } | null;
  }>;
}

function actLabel(t: string) {
  return t?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Activity";
}

export default function EducatorDashboardPage() {
  const { user }  = useAuthStore();
  const [data, setData]     = useState<DashboardData | null>(null);
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

  const hasLearners = data && data.totalLearners > 0;

  const stats = [
    { label: "Learners",        value: data?.totalLearners ?? 0,    icon: Users,         color: "text-blue-600",   bg: "bg-blue-50",    href: "/educator/learners"        },
    { label: "Active (30d)",    value: data?.activeLearners ?? 0,   icon: TrendingUp,    color: "text-emerald-600",bg: "bg-emerald-50", href: undefined                   },
    { label: "Completion Rate", value: `${data?.completionRate ?? 0}%`, icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-50",  href: "/educator/analytics"       },
    { label: "Avg Quiz Score",  value: `${data?.avgQuizScore ?? 0}%`, icon: Zap,          color: "text-amber-600",  bg: "bg-amber-50",   href: "/educator/assessments"     },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">Here's an overview of your learners and their activity.</p>
        </div>
        <Badge variant="success" size="md">
          <Users size={11} className="mr-1" /> Educator
        </Badge>
      </div>

      {/* No learners notice */}
      {!hasLearners && data && (
        <Card className="border-l-4 border-l-amber-400 bg-amber-50/40">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Users size={17} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">No learners assigned yet</p>
              <p className="text-sm text-text-secondary mt-0.5">
                Go to <strong>My Learners</strong> and use <em>Add Learner</em> to connect students by email.
              </p>
              <Link href="/educator/learners">
                <Button size="sm" className="mt-3">Go to My Learners</Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Stat cards */}
      {hasLearners && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            s.href ? (
              <Link key={s.label} href={s.href}>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-brand-100 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted font-medium mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} group-hover:scale-105 transition-transform`}>
                      <s.icon size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted font-medium mb-1">{s.label}</p>
                    <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                    <s.icon size={16} />
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Quick links */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Quick Access</h2>
          <span className="text-xs text-text-muted">Educator tools</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { label: "My Learners",       href: "/educator/learners",           icon: Users,         bg: "bg-blue-50",    text: "text-blue-600",    grad: "from-blue-500 to-cyan-400"      },
            { label: "Learning Tracker",  href: "/educator/learning-tracker",   icon: BookOpen,      bg: "bg-indigo-50",  text: "text-indigo-600",  grad: "from-indigo-500 to-blue-400"    },
            { label: "Assessments",       href: "/educator/assessments",        icon: Zap,           bg: "bg-amber-50",   text: "text-amber-600",   grad: "from-amber-500 to-orange-400"   },
            { label: "Create Assessment", href: "/educator/assessments/create", icon: Plus,          bg: "bg-violet-50",  text: "text-violet-600",  grad: "from-violet-500 to-purple-400"  },
            { label: "Analytics",         href: "/educator/analytics",          icon: BarChart2,     bg: "bg-brand-50",   text: "text-brand-600",   grad: "from-brand-500 to-blue-400"     },
            { label: "Activity",          href: "/educator/activity",           icon: Activity,      bg: "bg-rose-50",    text: "text-rose-600",    grad: "from-rose-500 to-pink-400"      },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-2.5 p-3 rounded-xl ${a.bg} hover:shadow-sm hover:scale-[1.02] transition-all`}>
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.grad} flex items-center justify-center shrink-0 shadow-sm`}>
                <a.icon size={13} className="text-white" />
              </div>
              <span className={`text-xs font-semibold ${a.text}`}>{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Recent learner activity */}
      {data && data.recentActivity.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Recent Learner Activity</h2>
            <Link href="/educator/activity" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
          </div>
          <div className="space-y-0">
            {data.recentActivity.slice(0, 6).map((a, i) => (
              <div key={a._id}
                className={["flex items-center justify-between py-2.5 gap-4", i < data.recentActivity.length - 1 ? "border-b border-slate-50" : ""].join(" ")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center shrink-0 border border-brand-100">
                    <Activity size={12} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{actLabel(a.activityType)}</p>
                    <p className="text-[11px] text-text-muted truncate">{a.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.userId && <p className="text-xs font-medium text-text-secondary">{a.userId.name}</p>}
                  <p className="text-[10px] text-text-muted flex items-center gap-1 justify-end">
                    <Clock size={9} />
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Assistant promo */}
      <Card className="bg-gradient-to-r from-brand-600 to-blue-500 border-0 text-white shadow-lg shadow-brand-200/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm mb-1">AI Assistant</p>
            <p className="text-sm text-white/80 mb-3">Generate quiz questions, learning resources, and career guidance for your learners.</p>
            <Link href="/ai-assistant">
              <Button variant="secondary" size="sm" className="bg-white text-brand-700 hover:bg-brand-50 border-transparent shadow-sm">
                Open Assistant →
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

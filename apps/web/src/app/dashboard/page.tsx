"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Map, FileText, Target, Mic2, Briefcase, BookOpen,
  Brain, BarChart2, ArrowRight, Sparkles, TrendingUp,
  ClipboardList, Activity, Zap,
} from "lucide-react";
import { getDashboardStats } from "@/src/lib/dashboard";
import { useAuthStore } from "@/src/store/authStore";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import { useState } from "react";

const quickActions = [
  { label: "Generate Roadmap", href: "/roadmap", icon: Map, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { label: "Analyze Resume", href: "/resume", icon: FileText, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "Skill Gap Check", href: "/skill-gap", icon: Target, color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { label: "Take a Quiz", href: "/quiz", icon: Zap, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "Mock Interview", href: "/mock-interview", icon: Mic2, color: "bg-green-50 text-green-600 hover:bg-green-100" },
  { label: "Job Readiness", href: "/job-readiness", icon: Briefcase, color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
];

const featureLinks = [
  { label: "Learning Tracker", href: "/learning", icon: BookOpen, desc: "Manage your tasks" },
  { label: "Learning Analytics", href: "/learning-analytics", icon: BarChart2, desc: "View progress charts" },
  { label: "Interview Prep", href: "/interview-prep", icon: Brain, desc: "Prepare for roles" },
  { label: "Activity Timeline", href: "/activity", icon: Activity, desc: "See your activity" },
  { label: "Portfolio Analyzer", href: "/portfolio-analyzer", icon: TrendingUp, desc: "Analyze GitHub" },
  { label: "Project Ideas", href: "/project-recommendation", icon: ClipboardList, desc: "AI project recs" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect non-student roles to their own dashboards
    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (user?.role === "educator") {
      router.replace("/educator/dashboard");
      return;
    }
    if (user?.role === "organization") {
      router.replace("/organization/dashboard");
      return;
    }
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.role, router]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return <PageLoader message="Loading your dashboard…" />;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Here's a summary of your learning journey
          </p>
        </div>
        <Badge variant="brand" size="md">
          <Sparkles size={12} className="mr-1.5" />
          AI-Powered Dashboard
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Career Roadmaps"
          value={stats?.roadmaps ?? 0}
          icon={Map}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          href="/roadmap/history"
          description="Generated"
        />
        <StatCard
          title="Resume Analyses"
          value={stats?.resumes ?? 0}
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          href="/resume/history"
          description="Completed"
        />
        <StatCard
          title="Skill Gap Reports"
          value={stats?.skillGaps ?? 0}
          icon={Target}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          href="/skill-gap/history"
          description="Analyzed"
        />
        <StatCard
          title="Interview Guides"
          value={stats?.interviews ?? 0}
          icon={Mic2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          href="/interview-prep/history"
          description="Generated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-text-secondary mt-0.5">
                Jump into any AI-powered feature
              </p>
            </CardHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={[
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group",
                    a.color,
                  ].join(" ")}
                >
                  <a.icon size={18} className="shrink-0" />
                  <span className="text-sm font-medium leading-tight">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Career readiness CTA */}
        <div>
          <Card className="h-full flex flex-col bg-gradient-to-br from-brand-600 to-brand-800 border-brand-500 text-white">
            <div className="flex-1">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <Briefcase size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-base mb-2">Career Readiness</h3>
              <p className="text-brand-100 text-sm leading-relaxed mb-4">
                Check your job readiness score based on your profile, skills, and
                activity.
              </p>
            </div>
            <Link href="/job-readiness">
              <Button
                variant="secondary"
                className="w-full bg-white text-brand-700 hover:bg-brand-50 border-transparent"
                rightIcon={<ArrowRight size={14} />}
              >
                Check Score
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* All features */}
      <Card>
        <CardHeader>
          <CardTitle>All Features</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Your complete learning and career toolkit
          </p>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {featureLinks.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-2 hover:bg-brand-50 hover:border-brand-200 border border-transparent transition-all duration-150 text-center group"
            >
              <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                <f.icon size={16} className="text-text-muted group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">{f.label}</p>
                <p className="text-[10px] text-text-muted">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

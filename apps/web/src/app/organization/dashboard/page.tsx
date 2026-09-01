"use client";

import Link from "next/link";
import {
  BarChart2, Target, Map, Briefcase, Sparkles,
  ClipboardList, Activity, TrendingUp, GraduationCap,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/src/store/authStore";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";

const quickActions = [
  { label: "Learning Analytics", href: "/learning-analytics", icon: BarChart2, color: "bg-brand-50 text-brand-600 hover:bg-brand-100" },
  { label: "Skill Gap Analysis", href: "/skill-gap", icon: Target, color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { label: "Career Roadmap", href: "/roadmap", icon: Map, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { label: "Job Readiness", href: "/job-readiness", icon: Briefcase, color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
  { label: "Learning Tracker", href: "/learning", icon: ClipboardList, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "Activity Timeline", href: "/activity", icon: Activity, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
];

export default function OrganizationDashboardPage() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Organization dashboard
          </p>
        </div>
        <Badge variant="info" size="md">
          <Building2 size={12} className="mr-1.5" />
          Organization
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Platform analytics and career readiness tools
          </p>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickActions.map((a) => (
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

      <Card className="border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1 text-sm">AI Insights</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Use the AI assistant to get career insights, skill gap summaries, and learning recommendations for your organization.
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

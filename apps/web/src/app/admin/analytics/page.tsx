"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart2, Users, Map, FileText, Target, Mic2,
  BookOpen, TrendingUp, ArrowLeft,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import api from "@/src/services/api";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin-analytics").then((r) => setStats(r.data)),
      api.get("/admin-analytics/skills").then((r) => setSkills(r.data)),
      api.get("/admin-analytics/career-goals").then((r) => setGoals(r.data)),
      api.get("/admin-analytics/user-growth").then((r) => setGrowth(r.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading analytics…" />;

  const growthData = Object.entries(growth).map(([month, count]) => ({
    month: month.slice(0, 7),
    users: count as number,
  }));

  const featureData = stats
    ? [
        { feature: "Roadmaps", count: stats.totalRoadmaps ?? 0 },
        { feature: "Resumes", count: stats.totalResumeAnalyses ?? 0 },
        { feature: "Skill Gaps", count: stats.totalSkillGapAnalyses ?? 0 },
        { feature: "Interviews", count: stats.totalInterviewPreparations ?? 0 },
        { feature: "Learning", count: stats.totalLearningTasks ?? 0 },
      ]
    : [];

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Dashboard</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart2 size={22} className="text-brand-600" />
            Platform Analytics
          </h1>
          <p className="text-text-secondary text-sm">Detailed breakdown of platform usage and growth</p>
        </div>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers ?? 0} icon={Users} iconColor="text-brand-600" iconBg="bg-brand-50" />
          <StatCard title="Roadmaps" value={stats.totalRoadmaps ?? 0} icon={Map} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
          <StatCard title="Resume Analyses" value={stats.totalResumeAnalyses ?? 0} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
          <StatCard title="Skill Gaps" value={stats.totalSkillGapAnalyses ?? 0} icon={Target} iconColor="text-rose-600" iconBg="bg-rose-50" />
          <StatCard title="Interview Guides" value={stats.totalInterviewPreparations ?? 0} icon={Mic2} iconColor="text-green-600" iconBg="bg-green-50" />
          <StatCard title="Learning Tasks" value={stats.totalLearningTasks ?? 0} icon={BookOpen} iconColor="text-amber-600" iconBg="bg-amber-50" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        {growthData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-600" />
                <CardTitle>User Growth Over Time</CardTitle>
              </div>
            </CardHeader>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Feature Usage */}
        {featureData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-brand-600" />
                <CardTitle>Feature Usage</CardTitle>
              </div>
            </CardHeader>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="feature" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Top Skills</CardTitle></CardHeader>
            <div className="space-y-2.5">
              {skills.slice(0, 10).map(([name, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-text-muted w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm text-text-secondary flex-1 truncate">{name}</span>
                  <div className="w-24 bg-surface-3 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-brand-500"
                      style={{ width: `${(count / (skills[0]?.[1] ?? 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Popular Career Goals */}
        {goals.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Top Career Goals</CardTitle></CardHeader>
            <div className="space-y-2">
              {goals.slice(0, 10).map(([goal, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-text-secondary truncate">{goal}</span>
                  </div>
                  <Badge variant="default" size="sm" className="ml-2 shrink-0">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

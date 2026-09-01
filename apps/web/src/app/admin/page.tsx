"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Map, FileText, Target, Mic2, BookOpen,
  TrendingUp, Activity, BarChart2, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import api from "@/src/services/api";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [careerGoals, setCareerGoals] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any>({});
  const [activityAnalytics, setActivityAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin-analytics").then((r) => setAnalytics(r.data)),
      api.get("/admin-analytics/skills").then((r) => setSkills(r.data)),
      api.get("/admin-analytics/career-goals").then((r) => setCareerGoals(r.data)),
      api.get("/admin-analytics/user-growth").then((r) => setUserGrowth(r.data)),
      api.get("/admin-analytics/activity-analytics").then((r) => setActivityAnalytics(r.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading admin dashboard…" />;

  // Format data for charts
  const userGrowthData = Object.entries(userGrowth).map(([month, count]) => ({
    month: month.slice(0, 7),
    users: count as number,
  }));

  const skillsChartData = skills.slice(0, 8).map(([name, count]: [string, number]) => ({
    name: name.length > 14 ? name.slice(0, 14) + "…" : name,
    value: count,
  }));

  const activityData = activityAnalytics.slice(0, 8).map(([type, count]: [string, number]) => ({
    name: type?.replace(/_/g, " ").slice(0, 14),
    value: count,
  }));

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Badge variant="brand" className="cursor-pointer hover:opacity-90">
              <Users size={12} className="mr-1" />
              Manage Users
            </Badge>
          </Link>
          <Link href="/admin/analytics">
            <Badge variant="default" className="cursor-pointer hover:opacity-90">
              <BarChart2 size={12} className="mr-1" />
              Analytics
            </Badge>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers ?? 0}
          icon={Users}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          href="/admin/users"
        />
        <StatCard
          title="Roadmaps Generated"
          value={analytics?.totalRoadmaps ?? 0}
          icon={Map}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Resume Analyses"
          value={analytics?.totalResumeAnalyses ?? 0}
          icon={FileText}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Skill Gap Analyses"
          value={analytics?.totalSkillGapAnalyses ?? 0}
          icon={Target}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Interview Guides"
          value={analytics?.totalInterviewPreparations ?? 0}
          icon={Mic2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Learning Tasks"
          value={analytics?.totalLearningTasks ?? 0}
          icon={BookOpen}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth chart */}
        {userGrowthData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-600" />
                <CardTitle>User Growth</CardTitle>
              </div>
            </CardHeader>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                  <Bar dataKey="users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Activity chart */}
        {activityData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-brand-600" />
                <CardTitle>Activity Breakdown</CardTitle>
              </div>
            </CardHeader>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name: string; percent: number }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={10}
                  >
                    {activityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular skills */}
        {skillsChartData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <CardTitle>Most Popular Skills</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {skills.slice(0, 8).map(([name, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-28 truncate">{name}</span>
                  <div className="flex-1 bg-surface-3 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${(count / (skills[0]?.[1] ?? 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Popular career goals */}
        {careerGoals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target size={16} className="text-rose-600" />
                <CardTitle>Top Career Goals</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2">
              {careerGoals.slice(0, 8).map(([goal, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-text-secondary truncate max-w-[180px]">{goal}</span>
                  </div>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

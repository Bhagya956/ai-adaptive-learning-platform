"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Map, FileText, Target, Mic2, BookOpen,
  TrendingUp, Activity, BarChart2, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

const COLORS = ["#6366f1", "#8b5cf6", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];

export default function AdminPage() {
  const [analytics, setAnalytics]           = useState<any>(null);
  const [skills, setSkills]                 = useState<any[]>([]);
  const [careerGoals, setCareerGoals]       = useState<any[]>([]);
  const [userGrowth, setUserGrowth]         = useState<any>({});
  const [activityAnalytics, setActivityAnalytics] = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin-analytics").then((r) => setAnalytics(r.data)),
      api.get("/admin-analytics/skills").then((r) => setSkills(r.data)),
      api.get("/admin-analytics/career-goals").then((r) => setCareerGoals(r.data)),
      api.get("/admin-analytics/user-growth").then((r) => setUserGrowth(r.data)),
      api.get("/admin-analytics/activity-analytics").then((r) => {
        const raw = r.data;
        const entries = Array.isArray(raw)
          ? raw
          : Object.entries(raw as Record<string, number>).sort((a, b) => b[1] - a[1]);
        setActivityAnalytics(entries);
      }),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading admin dashboard…" />;

  const userGrowthData = Object.entries(userGrowth).map(([month, count]) => ({
    month: month.slice(0, 7), users: count as number,
  }));

  const activityData = activityAnalytics.slice(0, 8).map(([type, count]: [string, number]) => ({
    name: type?.replace(/_/g, " ").slice(0, 14),
    value: count,
  }));

  const statCards: { title: string; value: number; icon: React.ElementType; color: string; bg: string; href: string }[] = [
    { title: "Total Users",        value: analytics?.totalUsers ?? 0,                  icon: Users,    color: "text-brand-600",   bg: "bg-brand-50",    href: "/admin/users"     },
    { title: "Roadmaps",           value: analytics?.totalRoadmaps ?? 0,               icon: Map,      color: "text-indigo-600",  bg: "bg-indigo-50",   href: "/admin/analytics" },
    { title: "Resume Analyses",    value: analytics?.totalResumeAnalyses ?? 0,         icon: FileText, color: "text-blue-600",    bg: "bg-blue-50",     href: "/admin/analytics" },
    { title: "Skill Gap Reports",  value: analytics?.totalSkillGapAnalyses ?? 0,       icon: Target,   color: "text-rose-600",    bg: "bg-rose-50",     href: "/admin/analytics" },
    { title: "Interview Guides",   value: analytics?.totalInterviewPreparations ?? 0,  icon: Mic2,     color: "text-emerald-600", bg: "bg-emerald-50",  href: "/admin/analytics" },
    { title: "Learning Tasks",     value: analytics?.totalLearningTasks ?? 0,          icon: BookOpen, color: "text-amber-600",   bg: "bg-amber-50",    href: "/admin/analytics" },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Badge variant="brand" className="cursor-pointer hover:opacity-90 px-3 py-1.5">
              <Users size={11} className="mr-1" /> Users
            </Badge>
          </Link>
          <Link href="/admin/analytics">
            <Badge variant="default" className="cursor-pointer hover:opacity-90 px-3 py-1.5">
              <BarChart2 size={11} className="mr-1" /> Analytics
            </Badge>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <Link key={s.title} href={s.href}>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-brand-100 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted font-medium mb-1">{s.title}</p>
                  <p className="text-2xl font-bold text-text-primary">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color} group-hover:scale-105 transition-transform`}>
                  <s.icon size={16} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User growth */}
        {userGrowthData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-brand-600" />
                <CardTitle>User Growth</CardTitle>
              </div>
            </CardHeader>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.07)" }} />
                  <Bar dataKey="users" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Activity breakdown */}
        {activityData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-brand-600" />
                <CardTitle>Activity Breakdown</CardTitle>
              </div>
            </CardHeader>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={activityData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false} fontSize={10}>
                    {activityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Popular skills */}
        {skills.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-amber-500" />
                <CardTitle>Most Popular Skills</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-2.5">
              {skills.slice(0, 8).map(([name, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary w-28 truncate">{name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${(count / (skills[0]?.[1] ?? 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-5 text-right">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Career goals */}
        {careerGoals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target size={15} className="text-rose-600" />
                <CardTitle>Top Career Goals</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-1.5">
              {careerGoals.slice(0, 8).map(([goal, count]: [string, number], i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
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

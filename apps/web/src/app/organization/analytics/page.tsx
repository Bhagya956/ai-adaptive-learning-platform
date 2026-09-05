"use client";

import { useEffect, useState } from "react";
import { BarChart2, Users, UserCheck, CheckCircle2, Zap, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import api from "@/src/services/api";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

interface AnalyticsData {
  totalStudents: number;
  totalMentors: number;
  assignedStudents: number;
  unassignedStudents: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  totalQuizzes: number;
  avgQuizScore: number;
  activityBreakdown: Record<string, number>;
  studentStats: Array<{ name: string; totalTasks: number; completedTasks: number; completionRate: number; totalQuizzes: number }>;
  mentorStats: Array<{ name: string; studentCount: number }>;
}

export default function OrganizationAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/organization/analytics")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading analytics…" />;
  if (!data) return <EmptyState icon={BarChart2} title="Analytics unavailable" description="Could not load analytics data." />;

  const completionRate = data.completionRate ?? 0;
  const radialData = [{ name: "Rate", value: completionRate, fill: "#6366f1" }];
  const taskBarData = [
    { name: "Completed", value: data.completedTasks, fill: "#10b981" },
    { name: "Pending",   value: data.pendingTasks,   fill: "#f59e0b" },
  ];
  const studentCompletionData = data.studentStats
    .filter((s) => s.totalTasks > 0)
    .slice(0, 10)
    .map((s) => ({ name: s.name.split(" ")[0], completionRate: s.completionRate }));
  const mentorBarData = data.mentorStats.map((m) => ({
    name: m.name.split(" ")[0], students: m.studentCount,
  }));
  const activityData = Object.entries(data.activityBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([type, count], i) => ({
      name: type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
      value: count, fill: COLORS[i % COLORS.length],
    }));

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BarChart2 size={22} className="text-brand-600" />
          Organization Analytics
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Learning performance and engagement across your organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students"    value={data.totalStudents}    icon={Users}      iconColor="text-blue-600"   iconBg="bg-blue-50" />
        <StatCard title="Total Mentors"     value={data.totalMentors}     icon={UserCheck}  iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="Completion Rate"   value={`${completionRate}%`}  icon={TrendingUp} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Avg Quiz Score"    value={`${data.avgQuizScore}%`} icon={Zap}      iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radial completion */}
        <Card>
          <CardHeader><CardTitle>Overall Completion Rate</CardTitle></CardHeader>
          <div className="h-52 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                barSize={14} data={radialData} startAngle={90} endAngle={90 - (completionRate / 100) * 360}>
                <RadialBar dataKey="value" background cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-text-primary tabular-nums">{completionRate}%</span>
              <span className="text-xs text-text-muted">Complete</span>
            </div>
          </div>
        </Card>

        {/* Task breakdown */}
        <Card>
          <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {taskBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student completion rates */}
      {studentCompletionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Completion Rates</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Task completion per student (top {studentCompletionData.length})</p>
          </CardHeader>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentCompletionData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(v) => [`${v ?? 0}%`, "Completion"]} />
                <Bar dataKey="completionRate" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Mentor student distribution */}
      {mentorBarData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students per Mentor</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mentorBarData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Activity breakdown */}
      {activityData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Breakdown</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Activity types across all org members</p>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} width={80} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {activityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

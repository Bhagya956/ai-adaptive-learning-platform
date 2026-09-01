"use client";

import { useEffect, useState } from "react";
import { BarChart2, CheckCircle2, Clock, TrendingUp, Lightbulb } from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import api from "@/src/services/api";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function LearningAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.get("/learning-analytics").then((r) => setAnalytics(r.data)).catch(console.error);
  }, []);

  if (!analytics) return <PageLoader message="Loading analytics…" />;

  const completionRate = analytics.completionRate ?? 0;
  const barData = [
    { name: "Completed", value: analytics.completedTasks ?? 0, fill: "#10b981" },
    { name: "Pending", value: analytics.pendingTasks ?? 0, fill: "#f59e0b" },
  ];
  const radialData = [{ name: "Rate", value: completionRate, fill: "#6366f1" }];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BarChart2 size={22} className="text-brand-600" />
          Learning Analytics
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Track your learning progress, patterns, and completion rates
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={analytics.totalTasks ?? 0} icon={BarChart2}
          iconColor="text-brand-600" iconBg="bg-brand-50" />
        <StatCard title="Completed" value={analytics.completedTasks ?? 0} icon={CheckCircle2}
          iconColor="text-success" iconBg="bg-success-bg" />
        <StatCard title="In Progress" value={analytics.pendingTasks ?? 0} icon={Clock}
          iconColor="text-warning" iconBg="bg-warning-bg" />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={TrendingUp}
          iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut / radial chart */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <div className="h-52 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="55%" outerRadius="80%"
                barSize={14}
                data={radialData}
                startAngle={90}
                endAngle={90 - (completionRate / 100) * 360}
              >
                <RadialBar dataKey="value" background cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-text-primary tabular-nums">
                {completionRate}%
              </span>
              <span className="text-xs text-text-muted">Complete</span>
            </div>
          </div>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Task Breakdown</CardTitle>
          </CardHeader>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Insight */}
      {analytics.insight && (
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
              <Lightbulb size={18} className="text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1 text-sm">AI Learning Insight</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{analytics.insight}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent completed */}
      {analytics.recentCompleted?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {analytics.recentCompleted.map((task: any) => (
              <div
                key={task._id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-success shrink-0" />
                  <span className="text-sm font-medium text-text-primary">{task.title}</span>
                </div>
                <span className="text-xs text-text-muted">
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

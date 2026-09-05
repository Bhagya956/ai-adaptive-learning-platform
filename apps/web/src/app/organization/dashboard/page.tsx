"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, Users, UserCheck, UserX, TrendingUp,
  Activity, Sparkles, Clock, AlertTriangle, BarChart2,
} from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import StatCard from "@/src/components/ui/StatCard";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface MentorDist {
  _id: string;
  name: string;
  email: string;
  studentCount: number;
}

interface NeedsAttention {
  _id: string;
  name: string;
  email: string;
  completionRate: number;
  inactive: boolean;
}

interface ActivityItem {
  _id: string;
  activityType: string;
  description: string;
  createdAt: string;
  userId: { name: string; email: string; role: string } | null;
}

interface DashboardData {
  totalMentors: number;
  totalStudents: number;
  assignedStudents: number;
  unassignedStudents: number;
  activeStudents: number;
  avgProgress: number;
  mentorDistribution: MentorDist[];
  needsAttention: NeedsAttention[];
  recentActivity: ActivityItem[];
}

const quickLinks = [
  { label: "All Mentors",    href: "/organization/mentors",     icon: Users,       color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { label: "Add Mentor",     href: "/organization/mentors/create", icon: UserCheck, color: "bg-green-50 text-green-600 hover:bg-green-100" },
  { label: "All Students",   href: "/organization/students",    icon: Users,       color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { label: "Add Student",    href: "/organization/students/create", icon: UserCheck, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
  { label: "Assignments",    href: "/organization/assignments", icon: UserX,       color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { label: "Analytics",      href: "/organization/analytics",   icon: BarChart2,   color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
];

function activityLabel(type: string) {
  return type?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Activity";
}

export default function OrganizationDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    api.get("/organization/dashboard")
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading dashboard…" />;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Organization overview — mentors, students, and learning progress
          </p>
        </div>
        <Badge variant="info" size="md">
          <Building2 size={12} className="mr-1.5" />
          Organization
        </Badge>
      </div>

      {/* Stat cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Mentors"     value={data.totalMentors}     icon={Users}      iconColor="text-indigo-600" iconBg="bg-indigo-50" href="/organization/mentors" />
          <StatCard title="Total Students"    value={data.totalStudents}    icon={Users}      iconColor="text-blue-600"   iconBg="bg-blue-50"   href="/organization/students" />
          <StatCard title="Assigned Students" value={data.assignedStudents} icon={UserCheck}  iconColor="text-success"    iconBg="bg-success-bg" />
          <StatCard title="Unassigned"        value={data.unassignedStudents} icon={UserX}    iconColor="text-warning"   iconBg="bg-warning-bg" href="/organization/assignments" />
          <StatCard title="Active Students"   value={data.activeStudents}   icon={TrendingUp} iconColor="text-brand-600"  iconBg="bg-brand-50" />
          <StatCard title="Avg Progress"      value={`${data.avgProgress}%`} icon={BarChart2} iconColor="text-violet-600" iconBg="bg-violet-50" href="/organization/analytics" />
        </div>
      )}

      {/* Quick links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Organization management tools</p>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((a) => (
            <Link key={a.href} href={a.href}
              className={["flex items-center gap-3 p-3 rounded-xl transition-all duration-150", a.color].join(" ")}>
              <a.icon size={18} className="shrink-0" />
              <span className="text-sm font-medium leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Mentor distribution */}
      {data && data.mentorDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mentor Distribution</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Students assigned per mentor</p>
          </CardHeader>
          <div className="space-y-0">
            {data.mentorDistribution.map((m, i) => (
              <div key={m._id}
                className={["flex items-center gap-3 py-3", i < data.mentorDistribution.length - 1 ? "border-b border-border" : ""].join(" ")}>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                  <p className="text-xs text-text-muted truncate">{m.email}</p>
                </div>
                <Badge variant={m.studentCount > 0 ? "brand" : "default"} size="sm">
                  {m.studentCount} student{m.studentCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Students needing attention */}
      {data && data.needsAttention.length > 0 && (
        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" />
              Students Needing Attention
            </CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Low progress or inactive in 14 days</p>
          </CardHeader>
          <div className="space-y-0">
            {data.needsAttention.map((s, i) => (
              <div key={s._id}
                className={["flex items-center gap-3 py-3", i < data.needsAttention.length - 1 ? "border-b border-border" : ""].join(" ")}>
                <div className="w-8 h-8 rounded-full bg-warning-bg flex items-center justify-center text-warning text-xs font-bold shrink-0">
                  {s.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                  <p className="text-xs text-text-muted">{s.completionRate}% tasks complete</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {s.inactive && <Badge variant="warning" size="sm">Inactive</Badge>}
                  {s.completionRate < 20 && <Badge variant="danger" size="sm">Low progress</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent activity */}
      {data && data.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">Latest actions from your mentors and students</p>
          </CardHeader>
          <div className="space-y-0">
            {data.recentActivity.map((a, i) => (
              <div key={a._id}
                className={["flex items-center justify-between py-3 gap-4", i < data.recentActivity.length - 1 ? "border-b border-border" : ""].join(" ")}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Activity size={14} className="text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{activityLabel(a.activityType)}</p>
                    <p className="text-xs text-text-muted truncate">{a.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {a.userId && <p className="text-xs font-medium text-text-secondary">{a.userId.name}</p>}
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

      {/* AI promo */}
      <Card className="border-l-4 border-l-brand-500">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-1 text-sm">AI Assistant</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Get career insights, learning recommendations, and guidance for your organization.
            </p>
            <Link href="/ai-assistant" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
              Open AI Assistant →
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

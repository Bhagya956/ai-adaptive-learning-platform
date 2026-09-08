"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2, Users, UserCheck, UserX, TrendingUp, Activity,
  Sparkles, Clock, AlertTriangle, BarChart2, Plus,
} from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface DashboardData {
  totalMentors: number; totalStudents: number;
  assignedStudents: number; unassignedStudents: number;
  activeStudents: number; avgProgress: number;
  mentorDistribution: Array<{ _id: string; name: string; email: string; studentCount: number }>;
  needsAttention: Array<{ _id: string; name: string; email: string; completionRate: number; inactive: boolean }>;
  recentActivity: Array<{ _id: string; activityType: string; description: string; createdAt: string; userId: { name: string; email: string; role: string } | null }>;
}

function actLabel(t: string) {
  return t?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? "";
}

export default function OrganizationDashboardPage() {
  const { user }  = useAuthStore();
  const [data, setData]     = useState<DashboardData | null>(null);
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

  const stats = [
    { label: "Mentors",     value: data?.totalMentors ?? 0,       icon: Users,      color: "text-indigo-600", bg: "bg-indigo-50", href: "/organization/mentors"    },
    { label: "Students",    value: data?.totalStudents ?? 0,      icon: Users,      color: "text-blue-600",   bg: "bg-blue-50",   href: "/organization/students"   },
    { label: "Assigned",    value: data?.assignedStudents ?? 0,   icon: UserCheck,  color: "text-emerald-600",bg: "bg-emerald-50",href: "/organization/assignments" },
    { label: "Avg Progress",value: `${data?.avgProgress ?? 0}%`,  icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", href: "/organization/analytics"  },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">Organization overview — mentors, students, and learning progress.</p>
        </div>
        <Badge variant="purple" size="md">
          <Building2 size={11} className="mr-1" /> Organization
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
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
        ))}
      </div>

      {/* Quick links */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { label: "All Mentors",    href: "/organization/mentors",            icon: Users,      bg: "bg-indigo-50", text: "text-indigo-600", grad: "from-indigo-500 to-blue-400"   },
            { label: "Add Mentor",     href: "/organization/mentors/create",     icon: Plus,       bg: "bg-emerald-50",text: "text-emerald-600",grad: "from-emerald-500 to-teal-400"  },
            { label: "All Students",   href: "/organization/students",           icon: Users,      bg: "bg-blue-50",   text: "text-blue-600",   grad: "from-blue-500 to-cyan-400"     },
            { label: "Add Student",    href: "/organization/students/create",    icon: Plus,       bg: "bg-cyan-50",   text: "text-cyan-600",   grad: "from-cyan-500 to-blue-400"     },
            { label: "Assignments",    href: "/organization/assignments",        icon: UserCheck,  bg: "bg-amber-50",  text: "text-amber-600",  grad: "from-amber-500 to-orange-400"  },
            { label: "Analytics",      href: "/organization/analytics",          icon: BarChart2,  bg: "bg-violet-50", text: "text-violet-600", grad: "from-violet-500 to-purple-400" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Mentor distribution */}
        {data && data.mentorDistribution.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Mentor Distribution</h2>
              <Link href="/organization/mentors" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
            </div>
            <div className="space-y-0">
              {data.mentorDistribution.slice(0, 5).map((m, i) => (
                <div key={m._id}
                  className={["flex items-center gap-3 py-2.5", i < data.mentorDistribution.length - 1 ? "border-b border-slate-50" : ""].join(" ")}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {m.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{m.name}</p>
                    <p className="text-[11px] text-text-muted truncate">{m.email}</p>
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
        {data && data.needsAttention.length > 0 ? (
          <Card className="border-l-4 border-l-amber-400">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={14} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-text-primary">Needs Attention</h2>
              <Badge variant="warning" size="sm">{data.needsAttention.length}</Badge>
            </div>
            <div className="space-y-0">
              {data.needsAttention.slice(0, 4).map((s, i) => (
                <div key={s._id}
                  className={["flex items-center gap-3 py-2.5", i < data.needsAttention.length - 1 ? "border-b border-slate-50" : ""].join(" ")}>
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold shrink-0">
                    {s.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{s.name}</p>
                    <p className="text-[11px] text-text-muted">{s.completionRate}% tasks complete</p>
                  </div>
                  <div className="flex gap-1">
                    {s.inactive && <Badge variant="warning" size="sm">Inactive</Badge>}
                    {s.completionRate < 20 && <Badge variant="danger" size="sm">Low</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          /* Recent activity when no attention needed */
          data && data.recentActivity.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-primary">Recent Activity</h2>
                <Link href="/organization/activity" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
              </div>
              <div className="space-y-0">
                {data.recentActivity.slice(0, 5).map((a, i) => (
                  <div key={a._id}
                    className={["flex items-center justify-between py-2.5 gap-3", i < 4 ? "border-b border-slate-50" : ""].join(" ")}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <Activity size={11} className="text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{actLabel(a.activityType)}</p>
                        {a.userId && <p className="text-[11px] text-text-muted truncate">{a.userId.name}</p>}
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted flex items-center gap-1 shrink-0">
                      <Clock size={9} />
                      {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )
        )}
      </div>

      {/* AI promo */}
      <Card className="bg-gradient-to-r from-violet-600 to-blue-500 border-0 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm mb-1">AI Assistant</p>
            <p className="text-sm text-white/80 mb-3">Get career insights, learning recommendations, and guidance for your organisation.</p>
            <Link href="/ai-assistant">
              <Button variant="secondary" size="sm" className="bg-white text-violet-700 hover:bg-violet-50 border-transparent">
                Open Assistant →
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

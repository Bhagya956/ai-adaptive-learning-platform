"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Map, FileText, Target, Mic2, Briefcase, BookOpen,
  Brain, BarChart2, ArrowRight, TrendingUp, ClipboardList,
  Activity, Zap, CheckCircle2, Clock, Users,
  Building2, GraduationCap,
} from "lucide-react";
import { getDashboardStats } from "@/src/lib/dashboard";
import { getTasks } from "@/src/lib/learning";
import { useAuthStore } from "@/src/store/authStore";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { PageLoader, Skeleton } from "@/src/components/ui/LoadingSpinner";

const quickActions = [
  { label: "Career Roadmap",   href: "/roadmap",                  icon: Map,      grad: "from-indigo-500 to-blue-400",     bg: "bg-indigo-50",   text: "text-indigo-600"  },
  { label: "Skill Gap",        href: "/skill-gap",                icon: Target,   grad: "from-rose-500 to-pink-400",       bg: "bg-rose-50",     text: "text-rose-600"    },
  { label: "Practice Quiz",    href: "/quiz",                     icon: Zap,      grad: "from-amber-500 to-orange-400",    bg: "bg-amber-50",    text: "text-amber-600"   },
  { label: "Mock Interview",   href: "/mock-interview",           icon: Mic2,     grad: "from-emerald-500 to-teal-400",    bg: "bg-emerald-50",  text: "text-emerald-600" },
  { label: "Resume",           href: "/resume",                   icon: FileText, grad: "from-blue-500 to-cyan-400",       bg: "bg-blue-50",     text: "text-blue-600"    },
  { label: "Resources",        href: "/resource-recommendation",  icon: BookOpen, grad: "from-violet-500 to-purple-400",   bg: "bg-violet-50",   text: "text-violet-600"  },
];

interface Task { _id: string; title: string; status: string; dueDate?: string | null; dueTime?: string | null }

function getDisplayStatus(task: Task) {
  if (task.status === "completed") return "completed";
  if (task.dueDate) {
    const due = new Date(`${task.dueDate}T${task.dueTime ?? "23:59"}:00`);
    if (!isNaN(due.getTime()) && new Date() > due) return "backlog";
  }
  if (task.status === "wip") return "wip";
  return "open";
}

export default function DashboardPage() {
  const { user }  = useAuthStore();
  const router    = useRouter();
  const [stats, setStats]   = useState<any>(null);
  const [tasks, setTasks_]  = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin")        { router.replace("/admin"); return; }
    if (user?.role === "educator")     { router.replace("/educator/dashboard"); return; }
    if (user?.role === "organization") { router.replace("/organization/dashboard"); return; }

    Promise.all([
      getDashboardStats().then(setStats),
      getTasks().then((data: Task[]) => setTasks_(data.slice(0, 5))),
    ]).catch(console.error).finally(() => setLoading(false));
  }, [user?.role, router]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Learning progress summary
  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter((t) => getDisplayStatus(t) === "completed").length;
  const wipTasks       = tasks.filter((t) => getDisplayStatus(t) === "wip").length;
  const backlogTasks   = tasks.filter((t) => getDisplayStatus(t) === "backlog").length;
  const progress       = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) return <PageLoader message="Loading your dashboard…" />;

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">Keep learning, keep growing.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="brand" size="md">
            <GraduationCap size={11} className="mr-1" /> Student
          </Badge>
          {user?.organizationName && (
            <Badge variant="purple" size="md">
              <Building2 size={11} className="mr-1" /> {user.organizationName}
            </Badge>
          )}
          {user?.mentorName && (
            <Badge variant="success" size="md">
              <Users size={11} className="mr-1" /> {user.mentorName}
            </Badge>
          )}
        </div>
      </div>

      {/* ── Learning Journey card ── */}
      {totalTasks > 0 && (
        <Card className="bg-gradient-to-r from-brand-600 to-blue-500 border-0 text-white shadow-lg shadow-brand-200/30">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">Your Learning Journey</p>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{totalTasks}</p>
                  <p className="text-[10px] text-white/70">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-300">{completedTasks}</p>
                  <p className="text-[10px] text-white/70">Completed</p>
                </div>
                {wipTasks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-300">{wipTasks}</p>
                    <p className="text-[10px] text-white/70">In Progress</p>
                  </div>
                )}
                {backlogTasks > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-300">{backlogTasks}</p>
                    <p className="text-[10px] text-white/70">Overdue</p>
                  </div>
                )}
              </div>
              <div className="max-w-xs">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-white/70 mt-1">{progress}% complete</p>
              </div>
            </div>
            <Link href="/learning">
              <Button variant="secondary" className="bg-white text-brand-700 hover:bg-brand-50 border-transparent shadow-sm" rightIcon={<ArrowRight size={13} />}>
                View Tasks
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Roadmaps",       value: stats?.roadmaps ?? 0,   icon: Map,      color: "text-indigo-600", bg: "bg-indigo-50", href: "/roadmap/history"  },
          { title: "Resume Reports", value: stats?.resumes ?? 0,    icon: FileText, color: "text-blue-600",   bg: "bg-blue-50",   href: "/resume/history"   },
          { title: "Skill Reports",  value: stats?.skillGaps ?? 0,  icon: Target,   color: "text-rose-600",   bg: "bg-rose-50",   href: "/skill-gap/history"},
          { title: "Interview Prep",  value: stats?.interviews ?? 0, icon: Mic2,     color: "text-emerald-600",bg: "bg-emerald-50",href: "/interview-prep/history"},
        ].map((s) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Quick Actions</h2>
              <span className="text-xs text-text-muted">Jump to any feature</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border border-transparent ${a.bg} hover:shadow-sm hover:scale-[1.02] transition-all duration-150 group`}>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.grad} flex items-center justify-center shrink-0 shadow-sm`}>
                    <a.icon size={13} className="text-white" />
                  </div>
                  <span className={`text-xs font-semibold ${a.text}`}>{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent tasks */}
        <div>
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Recent Tasks</h2>
              <Link href="/learning" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all →</Link>
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
                  <BookOpen size={18} className="text-brand-500" />
                </div>
                <p className="text-xs text-text-muted">No tasks yet.</p>
                <Link href="/learning">
                  <Button size="sm" className="mt-3">Add Task</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const ds = getDisplayStatus(task);
                  const statusConfig = {
                    open:      { color: "text-slate-500",   bg: "bg-slate-100",   label: "Open"    },
                    wip:       { color: "text-amber-600",   bg: "bg-amber-50",    label: "Active"  },
                    backlog:   { color: "text-rose-600",    bg: "bg-rose-50",     label: "Overdue" },
                    completed: { color: "text-emerald-600", bg: "bg-emerald-50",  label: "Done"    },
                  }[ds] ?? { color: "text-slate-500", bg: "bg-slate-100", label: "Open" };

                  return (
                    <div key={task._id} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                      <div className={`w-5 h-5 rounded-full ${statusConfig.bg} flex items-center justify-center shrink-0`}>
                        {ds === "completed"
                          ? <CheckCircle2 size={11} className="text-emerald-600" />
                          : ds === "backlog"
                          ? <Clock size={11} className="text-rose-500" />
                          : <div className={`w-2 h-2 rounded-full ${ds === "wip" ? "bg-amber-400" : "bg-slate-300"}`} />}
                      </div>
                      <p className={`text-xs font-medium flex-1 truncate ${ds === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                        {task.title}
                      </p>
                      <Badge variant={ds === "backlog" ? "danger" : ds === "completed" ? "success" : ds === "wip" ? "warning" : "default"} size="sm">
                        {statusConfig.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

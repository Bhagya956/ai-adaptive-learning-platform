"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Search, BookOpen, Zap, Clock, UserCheck, UserX } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import ProgressBar from "@/src/components/ui/ProgressBar";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

type Filter = "all" | "assigned" | "unassigned";

interface Student {
  _id: string;
  name: string;
  email: string;
  educatorId: string | null;
  mentorName: string | null;
  createdAt: string;
  progress: {
    totalTasks: number;
    doneTasks: number;
    completionRate: number;
    totalQuizzes: number;
    lastActivity: { activityType: string; createdAt: string } | null;
  };
}

export default function OrganizationStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/organization/students")
      .then((r) => setStudents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const visible = students.filter((s) => {
    const matchesFilter =
      filter === "all" ? true :
      filter === "assigned" ? !!s.educatorId :
      !s.educatorId;
    const q = search.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (loading) return <PageLoader message="Loading students…" />;

  const assigned = students.filter((s) => !!s.educatorId).length;
  const unassigned = students.length - assigned;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            All Students
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-success">{assigned} assigned</span>
            {" · "}
            <span className="text-warning">{unassigned} unassigned</span>
          </p>
        </div>
        <Link href="/organization/students/create">
          <Button leftIcon={<Plus size={14} />} size="sm">Add Student</Button>
        </Link>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-surface-3 rounded-lg p-1">
          {(["all", "assigned", "unassigned"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={["px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                filter === f ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"].join(" ")}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={14} />} />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Users}
          title={students.length === 0 ? "No students yet" : "No students match your filter"}
          description={students.length === 0 ? "Add students to your organization." : "Try changing your filter or search term."}
          action={students.length === 0 ? { label: "Add Student", onClick: () => { window.location.href = "/organization/students/create"; } } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((student) => {
            const rate = student.progress.completionRate;
            const color = rate >= 70 ? "success" : rate >= 40 ? "warning" : "danger";
            const lastSeen = student.progress.lastActivity
              ? new Date(student.progress.lastActivity.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : null;

            return (
              <Card key={student._id}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {student.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-text-primary text-sm truncate">{student.name}</p>
                      {student.mentorName
                        ? <Badge variant="success" size="sm" className="shrink-0 flex items-center gap-1"><UserCheck size={10} /> {student.mentorName}</Badge>
                        : <Badge variant="warning" size="sm" className="shrink-0 flex items-center gap-1"><UserX size={10} /> Unassigned</Badge>}
                    </div>
                    <p className="text-xs text-text-muted truncate mb-2">{student.email}</p>
                    <ProgressBar value={rate} color={color as any} size="sm" />
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <BookOpen size={11} /> {student.progress.doneTasks}/{student.progress.totalTasks} tasks
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Zap size={11} /> {student.progress.totalQuizzes} quiz{student.progress.totalQuizzes !== 1 ? "zes" : ""}
                      </span>
                      {lastSeen && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={11} /> Last active {lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

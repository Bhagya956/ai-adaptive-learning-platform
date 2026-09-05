"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Trophy, Calendar, Users, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface AttemptEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "pending" | "completed";
  score: number | null;
  totalQuestions: number | null;
  attemptedAt: string | null;
}

interface Assessment {
  _id: string;
  title: string;
  quizId: { topic: string; totalQuestions: number } | null;
  educatorId: { name: string; email: string } | null;
  assignedTo: AttemptEntry[];
  createdAt: string;
}

export default function OrganizationAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get("/organization/assessments")
      .then((r) => setAssessments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading assessments…" />;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ClipboardList size={22} className="text-brand-600" />
          Assessments
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Assessments created by your organization's mentors — monitor learner performance
        </p>
      </div>

      {assessments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assessments yet"
          description="Assessments created by your mentors will appear here. Mentors can create assessments from their Educator dashboard." />
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => {
            const total = a.assignedTo.length;
            const completed = a.assignedTo.filter((e) => e.status === "completed").length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isOpen = expanded === a._id;

            return (
              <Card key={a._id}>
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : a._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{a.title}</h3>
                      {a.quizId && <Badge variant="brand" size="sm">{a.quizId.topic}</Badge>}
                      {a.educatorId && (
                        <Badge variant="default" size="sm">Mentor: {a.educatorId.name}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap mb-2">
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {total} student{total !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-success" /> {completed}/{total} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="max-w-xs">
                      <ProgressBar value={pct} color={pct === 100 ? "success" : "brand"} size="sm" />
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge variant={pct === 100 ? "success" : pct > 0 ? "warning" : "default"} size="sm">{pct}%</Badge>
                    {isOpen ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="text-xs font-semibold text-text-muted uppercase tracking-wide pb-2">Student</th>
                          <th className="text-xs font-semibold text-text-muted uppercase tracking-wide pb-2">Status</th>
                          <th className="text-xs font-semibold text-text-muted uppercase tracking-wide pb-2">Score</th>
                          <th className="text-xs font-semibold text-text-muted uppercase tracking-wide pb-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {a.assignedTo.map((entry) => {
                          const scorePct = entry.status === "completed" && entry.totalQuestions
                            ? Math.round((entry.score! / entry.totalQuestions) * 100) : null;
                          const scoreColor = scorePct === null ? "default" : scorePct >= 70 ? "success" : scorePct >= 40 ? "warning" : "danger";
                          return (
                            <tr key={entry.studentId}>
                              <td className="py-2.5 pr-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                    {entry.studentName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-text-primary truncate">{entry.studentName}</p>
                                    <p className="text-[10px] text-text-muted truncate">{entry.studentEmail}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 pr-4">
                                <Badge variant={entry.status === "completed" ? "success" : "default"} size="sm">
                                  {entry.status === "completed" ? "Completed" : "Pending"}
                                </Badge>
                              </td>
                              <td className="py-2.5 pr-4">
                                {scorePct !== null
                                  ? <Badge variant={scoreColor as any} size="sm">{entry.score}/{entry.totalQuestions} ({scorePct}%)</Badge>
                                  : <span className="text-xs text-text-muted flex items-center gap-1"><Clock size={10} /> Not attempted</span>}
                              </td>
                              <td className="py-2.5 text-xs text-text-muted">
                                {entry.attemptedAt
                                  ? new Date(entry.attemptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

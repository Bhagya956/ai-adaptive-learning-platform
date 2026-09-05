"use client";

import { useEffect, useState } from "react";
import { UserCheck, UserX, RefreshCw, Users } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import { useToast } from "@/src/components/ui/Toast";

interface Mentor { _id: string; name: string; email: string }
interface Student {
  _id: string; name: string; email: string;
  educatorId: string | null; mentorName: string | null;
}

export default function AssignmentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Per-student selected mentor for assignment UI
  const [selections, setSelections] = useState<Record<string, string>>({});

  const refresh = () => {
    setLoading(true);
    Promise.all([
      api.get("/organization/students"),
      api.get("/organization/mentors"),
    ])
      .then(([sRes, mRes]) => {
        setStudents(sRes.data);
        setMentors(mRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const handleAssign = async (studentId: string) => {
    const mentorId = selections[studentId];
    if (!mentorId) { toast.warning("Select a mentor", "Choose a mentor from the dropdown first."); return; }
    setPendingId(studentId);
    try {
      await api.post(`/organization/students/${studentId}/assign-mentor`, { mentorId });
      toast.success("Assigned!", "Mentor assignment saved.");
      refresh();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message ?? "Could not assign mentor.");
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (studentId: string) => {
    setPendingId(studentId);
    try {
      await api.delete(`/organization/students/${studentId}/remove-mentor`);
      toast.success("Removed", "Student is now unassigned.");
      refresh();
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message ?? "Could not remove mentor.");
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <PageLoader message="Loading assignments…" />;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <UserCheck size={22} className="text-brand-600" />
            Mentor Assignments
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Assign, reassign or remove mentor connections for your students
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} />} onClick={refresh}>
          Refresh
        </Button>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students yet"
          description="Add students from the Students page first." />
      ) : (
        <div className="space-y-3">
          {students.map((s) => {
            const initials = s.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            const selectedMentorId = selections[s._id] ?? s.educatorId ?? "";
            const busy = pendingId === s._id;

            return (
              <Card key={s._id}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Student info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{s.name}</p>
                      <p className="text-xs text-text-muted truncate">{s.email}</p>
                    </div>
                  </div>

                  {/* Current mentor badge */}
                  <div className="shrink-0 min-w-[130px]">
                    {s.mentorName
                      ? <Badge variant="success" size="sm" className="flex items-center gap-1 w-fit"><UserCheck size={10} /> {s.mentorName}</Badge>
                      : <Badge variant="warning" size="sm" className="flex items-center gap-1 w-fit"><UserX size={10} /> Unassigned</Badge>}
                  </div>

                  {/* Mentor selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMentorId}
                      onChange={(e) => setSelections((prev) => ({ ...prev, [s._id]: e.target.value }))}
                      className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">— Select mentor —</option>
                      {mentors.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      onClick={() => handleAssign(s._id)}
                      loading={busy}
                      disabled={!selections[s._id] || selections[s._id] === s.educatorId}
                    >
                      {s.educatorId ? "Reassign" : "Assign"}
                    </Button>

                    {s.educatorId && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemove(s._id)}
                        loading={busy}
                      >
                        Remove
                      </Button>
                    )}
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

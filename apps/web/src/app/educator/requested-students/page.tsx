"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, XCircle, GraduationCap, Briefcase, BookOpen } from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import { useToast } from "@/src/components/ui/Toast";

interface Requester {
  _id: string;
  name: string;
  email: string;
  education?: string;
  careerGoal?: string;
  skills?: string[];
  createdAt?: string;
}

interface StudentRequest {
  _id: string;
  requesterId: Requester;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const statusBadge = (status: StudentRequest["status"]) => {
  if (status === "pending")  return <Badge variant="warning" size="sm">Pending</Badge>;
  if (status === "accepted") return <Badge variant="success" size="sm">Accepted</Badge>;
  return                            <Badge variant="danger"  size="sm">Rejected</Badge>;
};

export default function EducatorRequestedStudentsPage() {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [acting, setActing]     = useState<string | null>(null);
  const toast = useToast();

  const fetch = () => {
    setLoading(true);
    api.get("/educator/requests")
      .then((r) => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const act = async (id: string, action: "accept" | "reject") => {
    setActing(id);
    try {
      await api.post(`/educator/requests/${id}/${action}`);
      toast.success(
        action === "accept" ? "Student accepted" : "Request rejected",
        action === "accept"
          ? "The student can now log in and will appear in My Learners."
          : "The student has been notified that their request was declined."
      );
      fetch();
    } catch (e: any) {
      toast.error("Action failed", e?.response?.data?.message ?? "Please try again.");
    } finally {
      setActing(null);
    }
  };

  if (loading) return <PageLoader message="Loading student requests…" />;

  const pending  = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users size={22} className="text-brand-600" />
          Requested Students
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Students who have requested to learn under your guidance
        </p>
      </div>

      {/* Pending */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
          <Clock size={14} /> Pending Requests
          {pending.length > 0 && (
            <Badge variant="warning" size="sm">{pending.length}</Badge>
          )}
        </h2>

        {pending.length === 0 ? (
          <Card>
            <EmptyState icon={Clock} title="No pending requests" description="New student requests will appear here for your review." />
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => {
              const s = req.requesterId;
              const initials = s.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
              return (
                <Card key={req._id}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-text-primary">{s.name}</p>
                        {statusBadge(req.status)}
                      </div>
                      <p className="text-xs text-text-muted mb-2">{s.email}</p>

                      <div className="flex flex-wrap gap-3 text-xs text-text-secondary mb-2">
                        {s.education   && <span className="flex items-center gap-1"><GraduationCap size={11} /> {s.education}</span>}
                        {s.careerGoal  && <span className="flex items-center gap-1"><Briefcase size={11} /> {s.careerGoal}</span>}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Requested {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {s.skills && s.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {s.skills.slice(0, 6).map((sk) => (
                            <Badge key={sk} variant="brand" size="sm">{sk}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 size={13} />}
                          loading={acting === req._id}
                          onClick={() => act(req._id, "accept")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<XCircle size={13} />}
                          loading={acting === req._id}
                          onClick={() => act(req._id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
            Previously Reviewed
          </h2>
          <div className="space-y-2">
            {reviewed.map((req) => {
              const s = req.requesterId;
              return (
                <Card key={req._id} padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-text-muted text-xs font-bold shrink-0">
                      {s.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                      <p className="text-xs text-text-muted truncate">{s.email}</p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

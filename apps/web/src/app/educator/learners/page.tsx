"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Search, ChevronRight, BookOpen, Zap, Clock, UserPlus, Trash2, X } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import ProgressBar from "@/src/components/ui/ProgressBar";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import { useToast } from "@/src/components/ui/Toast";

interface LearnerProgress {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalQuizzes: number;
  lastActivity: { activityType: string; createdAt: string } | null;
}

interface Learner {
  _id: string;
  name: string;
  email: string;
  currentRole: string;
  careerGoal: string;
  skills: string[];
  createdAt: string;
  progress: LearnerProgress;
}

export default function MyLearnersPage() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [filtered, setFiltered] = useState<Learner[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // Add learner modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  // Remove confirmation
  const [removingId, setRemovingId] = useState<string | null>(null);
  const toast = useToast();

  const fetchLearners = () => {
    setLoading(true);
    api.get("/educator/learners")
      .then((r) => { setLearners(r.data); setFiltered(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLearners(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      learners.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.careerGoal?.toLowerCase().includes(q)
      )
    );
  }, [search, learners]);

  const handleAssign = async () => {
    if (!addEmail.trim()) {
      toast.warning("Email required", "Enter the student's email address.");
      return;
    }
    setAdding(true);
    try {
      await api.post("/educator/learners/assign", { email: addEmail.trim().toLowerCase() });
      toast.success("Learner added", `${addEmail} has been connected to your learner list.`);
      setAddEmail("");
      setShowAdd(false);
      fetchLearners();
    } catch (e: any) {
      toast.error("Could not add learner", e?.response?.data?.message ?? "An error occurred.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    setRemovingId(id);
    try {
      await api.delete(`/educator/learners/${id}/remove`);
      toast.success("Learner removed", `${name} has been removed from your list.`);
      fetchLearners();
    } catch (e: any) {
      toast.error("Could not remove", e?.response?.data?.message ?? "An error occurred.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <PageLoader message="Loading learners…" />;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            My Learners
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {learners.length} learner{learners.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <Button
          leftIcon={<UserPlus size={14} />}
          size="sm"
          onClick={() => setShowAdd(true)}
        >
          Add Learner
        </Button>
      </div>

      {/* Add Learner panel */}
      {showAdd && (
        <Card className="border border-brand-200 bg-brand-50/30">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Add a Learner</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Enter the student's registered email address to connect them to your list.
              </p>
            </div>
            <button
              onClick={() => { setShowAdd(false); setAddEmail(""); }}
              className="text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="student@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                leftIcon={<Users size={14} />}
              />
            </div>
            <Button onClick={handleAssign} loading={adding} size="sm">
              {adding ? "Adding…" : "Add"}
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      {learners.length > 0 && (
        <div className="max-w-sm">
          <Input
            placeholder="Search by name, email or goal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
      )}

      {/* Learner list */}
      {filtered.length === 0 && !search ? (
        <EmptyState
          icon={Users}
          title="No learners assigned yet"
          description="Use the Add Learner button above to connect students by their email address."
          action={{ label: "Add Learner", onClick: () => setShowAdd(true) }}
        />
      ) : filtered.length === 0 && search ? (
        <EmptyState
          icon={Users}
          title="No learners match your search"
          description="Try a different name or email."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((learner) => {
            const rate = learner.progress.completionRate;
            const color = rate >= 70 ? "success" : rate >= 40 ? "warning" : "danger";
            const lastSeen = learner.progress.lastActivity
              ? new Date(learner.progress.lastActivity.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric",
                })
              : null;

            return (
              <Card key={learner._id} className="group">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {learner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link href={`/educator/learners/${learner._id}`} className="font-semibold text-text-primary text-sm hover:text-brand-600 truncate">
                        {learner.name}
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/educator/learners/${learner._id}`}>
                          <ChevronRight size={16} className="text-text-muted hover:text-brand-600" />
                        </Link>
                        <button
                          onClick={() => handleRemove(learner._id, learner.name)}
                          disabled={removingId === learner._id}
                          className="p-1 rounded text-text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove learner"
                          aria-label={`Remove ${learner.name}`}
                        >
                          {removingId === learner._id
                            ? <span className="text-[10px] text-text-muted">…</span>
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted truncate mb-2">{learner.email}</p>

                    <div className="mb-2">
                      <ProgressBar value={rate} color={color as any} size="sm" />
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <BookOpen size={11} />
                        {learner.progress.completedTasks}/{learner.progress.totalTasks} tasks
                      </span>
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        <Zap size={11} />
                        {learner.progress.totalQuizzes} quiz{learner.progress.totalQuizzes !== 1 ? "zes" : ""}
                      </span>
                      {lastSeen && (
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={11} />
                          Last active {lastSeen}
                        </span>
                      )}
                      {learner.careerGoal && (
                        <Badge variant="default" size="sm" className="truncate max-w-[140px]">
                          {learner.careerGoal}
                        </Badge>
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

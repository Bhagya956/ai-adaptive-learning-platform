"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, ClipboardList, Users,
  CheckSquare, Square, Zap,
} from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Badge from "@/src/components/ui/Badge";
import { useToast } from "@/src/components/ui/Toast";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface Learner {
  _id: string;
  name: string;
  email: string;
  progress: { completionRate: number; totalQuizzes: number };
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const toast = useToast();

  const [learners, setLearners] = useState<Learner[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(true);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get("/educator/learners")
      .then((r) => setLearners(r.data))
      .catch(console.error)
      .finally(() => setLoadingLearners(false));
  }, []);

  const toggleLearner = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(learners.map((l) => l._id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleCreate = async () => {
    if (!title.trim()) { toast.warning("Title required", "Give this assessment a name."); return; }
    if (!topic.trim()) { toast.warning("Topic required", "Enter a quiz topic."); return; }
    if (selectedIds.size === 0) { toast.warning("No learners selected", "Select at least one learner to assign."); return; }

    setCreating(true);
    try {
      await api.post("/educator/assessments", {
        title: title.trim(),
        topic: topic.trim(),
        studentIds: Array.from(selectedIds),
      });
      toast.success("Assessment created!", `Assigned to ${selectedIds.size} learner${selectedIds.size !== 1 ? "s" : ""}.`);
      router.push("/educator/assessments");
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message ?? "Could not create assessment. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loadingLearners) return <PageLoader message="Loading learners…" />;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft size={14} />}
        onClick={() => router.back()}
      >
        Back to Assessments
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ClipboardList size={22} className="text-brand-600" />
          Create Assessment
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Generate an AI quiz on any topic and assign it to your learners
        </p>
      </div>

      {/* Step 1: Assessment details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
            Assessment Details
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Input
            label="Assessment Title"
            placeholder="e.g. JavaScript Fundamentals — Week 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Quiz Topic"
            placeholder="e.g. React Hooks, Python Decorators, SQL Joins"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            leftIcon={<Zap size={14} />}
            hint="The AI will generate 10 questions on this topic"
          />
        </div>
      </Card>

      {/* Step 2: Select learners */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
              Assign to Learners
            </CardTitle>
            {learners.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Select all
                </button>
                <span className="text-text-muted text-xs">·</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {selectedIds.size > 0 && (
            <p className="text-xs text-brand-600 mt-1">{selectedIds.size} learner{selectedIds.size !== 1 ? "s" : ""} selected</p>
          )}
        </CardHeader>

        {learners.length === 0 ? (
          <div className="py-8 text-center">
            <Users size={28} className="text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No assigned learners.</p>
            <p className="text-xs text-text-muted mt-1">
              Add learners from{" "}
              <a href="/educator/learners" className="text-brand-600 hover:underline">
                My Learners
              </a>{" "}
              first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {learners.map((learner) => {
              const selected = selectedIds.has(learner._id);
              return (
                <button
                  key={learner._id}
                  onClick={() => toggleLearner(learner._id)}
                  className={[
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-border hover:border-brand-300 hover:bg-surface-3",
                  ].join(" ")}
                >
                  {selected
                    ? <CheckSquare size={16} className="text-brand-600 shrink-0" />
                    : <Square size={16} className="text-text-muted shrink-0" />}
                  <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {learner.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{learner.name}</p>
                    <p className="text-xs text-text-muted truncate">{learner.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="default" size="sm">{learner.progress.completionRate}% tasks</Badge>
                    <Badge variant="default" size="sm">{learner.progress.totalQuizzes} quizzes</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* Create button */}
      <Button
        onClick={handleCreate}
        loading={creating}
        disabled={learners.length === 0}
        leftIcon={<Sparkles size={14} />}
        className="w-full"
        size="lg"
      >
        {creating ? "Generating quiz and assigning…" : "Create & Assign Assessment"}
      </Button>
      <p className="text-xs text-text-muted text-center -mt-2">
        The AI will generate a 10-question quiz on the specified topic and assign it to the selected learners.
      </p>
    </div>
  );
}

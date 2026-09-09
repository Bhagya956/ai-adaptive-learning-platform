"use client";

import { useEffect, useState } from "react";
import {
  Mic2, Sparkles, Send, Trophy, CheckCircle, AlertCircle,
  MessageSquare, Mic, ChevronDown,
} from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { InlineLoader } from "@/src/components/ui/LoadingSpinner";

type Level = "beginner" | "intermediate" | "experienced";

const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: "beginner",     label: "Beginner",     description: "Foundational concepts, little experience" },
  { value: "intermediate", label: "Intermediate",  description: "1–3 years, practical applied questions" },
  { value: "experienced",  label: "Experienced",   description: "Senior-level, scenario-based depth" },
];

export default function MockInterviewPage() {
  const [role, setRole]           = useState("");
  const [level, setLevel]         = useState<Level>("intermediate");
  const [loading, setLoading]     = useState(false);
  const [interview, setInterview] = useState<any>(null);
  const [answers, setAnswers]     = useState<string[]>([]);
  const [result, setResult]       = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory]     = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => { fetchHistory(); }, []);

  const generateInterview = async () => {
    if (!role.trim()) {
      toast.warning("Role required", "Enter the job role you want to practice for.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/mock-interview", { role, level });
      setInterview(response.data);
      setAnswers(Array(response.data.questions?.length ?? 0).fill(""));
      setResult(null);
      fetchHistory();
    } catch {
      toast.error("Generation failed", "Could not generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const r = await api.get("/mock-interview/history");
      setHistory(Array.isArray(r.data) ? r.data : []);
    } catch { /* silent */ }
  };

  const submitInterview = async () => {
    const empty = answers.some((a) => !a.trim());
    if (empty) {
      toast.warning("Incomplete", "Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post(`/mock-interview/${interview._id}/submit`, { answers });
      setResult(response.data);
      fetchHistory();
      toast.success("Interview evaluated!", "Your answers have been assessed.");
    } catch {
      toast.error("Submit failed", "Could not evaluate your answers.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const totalCount    = interview?.questions?.length ?? 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Mic2 size={22} className="text-green-600" />
          Mock Interview
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Practice interview questions for any role and get detailed feedback
        </p>
      </div>

      {/* Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Setup</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Choose your role and experience level</p>
        </CardHeader>

        {/* Role input */}
        <div className="mb-4">
          <Input
            label="Job role / topic"
            placeholder="e.g. Frontend Developer, Data Analyst, Product Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generateInterview()}
            leftIcon={<Mic2 size={14} />}
          />
        </div>

        {/* Level selector */}
        <div className="mb-5">
          <label className="text-sm font-medium text-text-primary mb-2 block">Experience level</label>
          <div className="grid grid-cols-3 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={[
                  "flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-150",
                  level === l.value
                    ? "border-green-600 bg-green-50"
                    : "border-border bg-surface hover:border-green-300 hover:bg-surface-3",
                ].join(" ")}
              >
                <span className={["text-sm font-semibold",
                  level === l.value ? "text-green-700" : "text-text-primary"].join(" ")}>
                  {l.label}
                </span>
                <span className="text-xs text-text-muted leading-snug">{l.description}</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={generateInterview} loading={loading} leftIcon={<Sparkles size={14} />}>
          {loading ? "Generating questions…" : "Start Interview"}
        </Button>
      </Card>

      {loading && <InlineLoader message="Generating interview questions…" />}

      {/* Result */}
      {result && (
        <Card className="border-2 border-brand-200 bg-brand-50/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Interview Result</h3>
              <p className="text-sm text-text-secondary">
                {result.role ?? role}
                {result.level && (
                  <span className="ml-2">
                    <Badge variant="default" size="sm" className="capitalize">{result.level}</Badge>
                  </span>
                )}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold text-brand-600 tabular-nums">{result.score}</p>
              <p className="text-xs text-text-muted">/100</p>
            </div>
          </div>
          <ProgressBar
            value={result.score}
            color={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "danger"}
            size="md" showLabel className="mb-5"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, label: "Strengths", items: result.strengths, color: "text-success" },
              { icon: AlertCircle, label: "Weaknesses", items: result.weaknesses, color: "text-warning" },
              { icon: MessageSquare, label: "Feedback", items: result.feedback, color: "text-brand-600" },
            ].map(({ icon: Icon, label, items, color }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={14} className={color} />
                  <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">{label}</h4>
                </div>
                <ul className="space-y-1.5">
                  {(items ?? []).map((s: string, i: number) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${color.replace("text-", "bg-")} mt-1.5 shrink-0`} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Questions */}
      {interview && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{interview.role}</Badge>
              <Badge variant="default" size="sm" className="capitalize">{level}</Badge>
            </div>
            <span className="text-xs text-text-muted">{answeredCount}/{totalCount} answered</span>
          </div>
          {totalCount > 0 && <ProgressBar value={answeredCount} max={totalCount} size="sm" />}

          {interview.questions.map((question: string, index: number) => (
            <Card key={index}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-7 h-7 rounded-lg bg-green-50 text-green-700 text-xs font-bold flex items-center justify-center shrink-0">
                  Q{index + 1}
                </div>
                <p className="font-medium text-sm text-text-primary leading-relaxed">{question}</p>
              </div>
              <Textarea
                value={answers[index] ?? ""}
                onChange={(e) => {
                  const updated = [...answers];
                  updated[index] = e.target.value;
                  setAnswers(updated);
                }}
                placeholder="Type your answer here…"
                rows={4}
              />
            </Card>
          ))}

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-text-secondary">
              {totalCount - answeredCount > 0
                ? `${totalCount - answeredCount} question(s) remaining`
                : "All questions answered — ready to submit!"}
            </p>
            <Button onClick={submitInterview} loading={submitting} leftIcon={<Send size={14} />}>
              Submit Interview
            </Button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Previous Sessions</CardTitle></CardHeader>
          <div className="space-y-2">
            {history.slice(0, 5).map((h: any) => (
              <div key={h._id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{h.role}</p>
                  {h.level && (
                    <Badge variant="default" size="sm" className="capitalize shrink-0">{h.level}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {h.score > 0 && (
                    <Badge variant={h.score >= 70 ? "success" : h.score >= 40 ? "warning" : "danger"} size="sm">
                      {h.score}/100
                    </Badge>
                  )}
                  <span className="text-xs text-text-muted">
                    {new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Voice interview coming soon banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-3 border border-border rounded-xl text-sm">
        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border">
          <Mic size={15} className="text-text-muted" />
        </div>
        <div>
          <p className="font-medium text-text-primary text-sm">Voice Interview</p>
          <p className="text-xs text-text-muted">Voice-based mock interviews are currently in development.</p>
        </div>
        <span className="ml-auto shrink-0">
          <Badge variant="default" size="sm">Coming Soon</Badge>
        </span>
      </div>
    </div>
  );
}

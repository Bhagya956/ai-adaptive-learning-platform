"use client";

import { useEffect, useState } from "react";
import { Mic2, Sparkles, Send, Trophy, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { InlineLoader } from "@/src/components/ui/LoadingSpinner";

export default function MockInterviewPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateInterview = async () => {
    if (!role.trim()) {
      toast.warning("Role required", "Enter the job role for the mock interview.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/mock-interview", { role });
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
      const response = await api.get("/mock-interview/history");
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch {
      console.error("Failed to load history");
    }
  };

  const submitInterview = async () => {
    const empty = answers.some((a) => !a.trim());
    if (empty) {
      toast.warning("Incomplete answers", "Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post(`/mock-interview/${interview._id}/submit`, { answers });
      setResult(response.data);
      fetchHistory();
      toast.success("Interview evaluated!", "Your answers have been assessed.");
    } catch {
      toast.error("Submit failed", "Could not evaluate your interview.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const totalCount = interview?.questions?.length ?? 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Mic2 size={22} className="text-green-600" />
          AI Mock Interview
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Practice with AI-generated interview questions and get detailed feedback
        </p>
      </div>

      {/* Generate section */}
      <Card>
        <CardHeader>
          <CardTitle>Start Interview</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Enter the role you want to practice for</p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateInterview()}
              leftIcon={<Mic2 size={14} />}
            />
          </div>
          <Button onClick={generateInterview} loading={loading} leftIcon={<Sparkles size={14} />}>
            {loading ? "Generating…" : "Start Interview"}
          </Button>
        </div>
      </Card>

      {loading && <InlineLoader message="Generating interview questions…" />}

      {/* Result card */}
      {result && (
        <Card className="border-2 border-brand-200 bg-brand-50/30">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary">Interview Result</h3>
              <p className="text-sm text-text-secondary">{result.role ?? role}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold text-brand-600 tabular-nums">{result.score}</p>
              <p className="text-xs text-text-muted">/100</p>
            </div>
          </div>
          <ProgressBar
            value={result.score}
            color={result.score >= 70 ? "success" : result.score >= 40 ? "warning" : "danger"}
            size="md"
            showLabel
            className="mb-5"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle size={14} className="text-success" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Strengths</h4>
              </div>
              <ul className="space-y-1.5">
                {result.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-success mt-1.5 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={14} className="text-warning" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Weaknesses</h4>
              </div>
              <ul className="space-y-1.5">
                {result.weaknesses?.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-warning mt-1.5 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquare size={14} className="text-brand-600" />
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Feedback</h4>
              </div>
              <ul className="space-y-1.5">
                {result.feedback?.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Questions */}
      {interview && !result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="brand">{interview.role}</Badge>
            <span className="text-xs text-text-muted">
              {answeredCount}/{totalCount} answered
            </span>
          </div>
          {totalCount > 0 && (
            <ProgressBar value={answeredCount} max={totalCount} size="sm" />
          )}

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
            <Button
              onClick={submitInterview}
              loading={submitting}
              leftIcon={<Send size={14} />}
            >
              Submit Interview
            </Button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Interview History</CardTitle></CardHeader>
          <div className="space-y-2">
            {history.map((item: any) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <Mic2 size={14} className="text-text-muted" />
                  <span className="text-sm font-medium text-text-primary">{item.role}</span>
                </div>
                <div className="flex items-center gap-3">
                  {item.score !== undefined && (
                    <Badge
                      variant={item.score >= 70 ? "success" : item.score >= 40 ? "warning" : "danger"}
                      size="sm"
                    >
                      {item.score}/100
                    </Badge>
                  )}
                  <span className="text-xs text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

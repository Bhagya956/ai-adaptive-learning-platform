"use client";

import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle2, Clock, Sparkles, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import ProgressBar from "@/src/components/ui/ProgressBar";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import { useToast } from "@/src/components/ui/Toast";

interface Question {
  _id: string;
  question: string;
  type: "mcq" | "truefalse";
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
}

interface AssignedQuiz {
  _id: string;  // quiz document id
  topic: string;
  totalQuestions: number;
  questions: Question[];
}

interface AssignedAssessment {
  _id: string;  // assessment id
  title: string;
  educatorName: string;
  createdAt: string;
  quiz: AssignedQuiz | null;
  attempt: {
    status: "pending" | "completed";
    score: number | null;
    totalQuestions: number | null;
    attemptedAt: string | null;
  } | null;
}

type TakeState = "idle" | "taking" | "submitted";

export default function AssignedAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssignedAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Active quiz-taking state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [takeState, setTakeState] = useState<TakeState>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [lastScore, setLastScore] = useState<{ score: number; totalQuestions: number } | null>(null);

  const fetchAssessments = () => {
    setLoading(true);
    api.get("/student/assessments")
      .then((r) => setAssessments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssessments(); }, []);

  const startAssessment = (id: string) => {
    setActiveId(id);
    setAnswers({});
    setTakeState("taking");
    setLastScore(null);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submitAssessment = async () => {
    if (!activeId) return;
    const assessment = assessments.find((a) => a._id === activeId);
    if (!assessment?.quiz) return;

    const unanswered = assessment.quiz.questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      toast.warning("Incomplete", `${unanswered.length} question(s) still unanswered.`);
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        answer: answers[questionId],
      }));
      const r = await api.post(`/student/assessments/${activeId}/submit`, {
        answers: formattedAnswers,
      });
      setLastScore(r.data);
      setTakeState("submitted");
      fetchAssessments(); // refresh status
    } catch (e: any) {
      toast.error("Submit failed", e?.response?.data?.message ?? "Could not submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader message="Loading assigned assessments…" />;

  // Active quiz-taking view
  if (takeState === "taking" && activeId) {
    const assessment = assessments.find((a) => a._id === activeId);
    const questions = assessment?.quiz?.questions ?? [];
    const answeredCount = Object.keys(answers).length;
    const total = questions.length;

    return (
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => setTakeState("idle")}
          >
            Cancel
          </Button>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{assessment?.title}</h2>
            <p className="text-xs text-text-muted">Assigned by {assessment?.educatorName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary">
          <Badge variant="brand">{assessment?.quiz?.topic}</Badge>
          <span>{answeredCount}/{total} answered</span>
        </div>
        {total > 0 && (
          <ProgressBar value={answeredCount} max={total} color="brand" size="sm" />
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q._id}>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="font-medium text-text-primary text-sm leading-relaxed">{q.question}</p>
              </div>
              <div className="space-y-2 ml-10">
                {q.options.map((option, oi) => {
                  const isSelected = answers[q._id] === option;
                  return (
                    <label
                      key={oi}
                      className={[
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border hover:border-brand-300 hover:bg-surface-3",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={q._id}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswer(q._id, option)}
                        className="sr-only"
                      />
                      <div className={["w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                        isSelected ? "border-brand-600" : "border-slate-300"].join(" ")}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                      </div>
                      <span className="text-sm">{option}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-sm text-text-secondary">
            {answeredCount < total ? `${total - answeredCount} question(s) remaining` : "All questions answered"}
          </p>
          <Button
            onClick={submitAssessment}
            loading={submitting}
            leftIcon={<CheckCircle2 size={14} />}
            disabled={answeredCount === 0}
          >
            Submit Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Score result view
  if (takeState === "submitted" && lastScore) {
    const pct = lastScore.totalQuestions > 0
      ? Math.round((lastScore.score / lastScore.totalQuestions) * 100) : 0;

    return (
      <div className="max-w-3xl">
        <Card className="text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-amber-500" />
          </div>
          <p className="text-5xl font-bold text-text-primary tabular-nums mb-1">
            {lastScore.score}/{lastScore.totalQuestions}
          </p>
          <p className="text-text-secondary text-sm mb-4">{pct}% correct</p>
          <div className="max-w-xs mx-auto mb-6">
            <ProgressBar
              value={pct}
              color={pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger"}
              size="lg"
              showLabel
            />
          </div>
          <Badge variant={pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger"}>
            {pct >= 70 ? "Well done!" : pct >= 40 ? "Good effort" : "Keep practicing"}
          </Badge>
          <div className="mt-6">
            <Button variant="secondary" onClick={() => { setTakeState("idle"); setActiveId(null); }}>
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main list view
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <ClipboardList size={22} className="text-brand-600" />
            Assigned Assessments
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Assessments assigned to you by your educator
          </p>
        </div>
        <Link href="/quiz">
          <Button variant="secondary" size="sm" leftIcon={<Sparkles size={14} />}>
            My Quizzes
          </Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assigned assessments"
          description="Assessments from your educator will appear here."
        />
      ) : (
        <div className="space-y-3">
          {assessments.map((a) => {
            const done = a.attempt?.status === "completed";
            const pct = done && a.attempt?.totalQuestions
              ? Math.round((a.attempt.score! / a.attempt.totalQuestions) * 100) : null;
            const color = pct === null ? "default" : pct >= 70 ? "success" : pct >= 40 ? "warning" : "danger";

            return (
              <Card key={a._id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <ClipboardList size={18} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-text-primary">{a.title}</h3>
                        <p className="text-xs text-text-muted">
                          {a.quiz?.topic && <Badge variant="brand" size="sm" className="mr-1">{a.quiz.topic}</Badge>}
                          Assigned by {a.educatorName}
                        </p>
                      </div>
                      <Badge variant={done ? "success" : "default"} size="sm">
                        {done ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    {done && pct !== null && (
                      <div className="mb-2">
                        <ProgressBar value={pct} color={color as any} size="sm" />
                        <p className="text-xs text-text-muted mt-1">
                          Score: {a.attempt?.score}/{a.attempt?.totalQuestions} ({pct}%)
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      {!done && a.quiz && (
                        <Button size="sm" onClick={() => startAssessment(a._id)}>
                          Start Assessment
                        </Button>
                      )}
                      {done && (
                        <span className="text-xs text-success flex items-center gap-1">
                          <CheckCircle2 size={12} /> Submitted
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

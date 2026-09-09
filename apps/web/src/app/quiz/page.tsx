"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Zap, Sparkles, Clock, CheckCircle2, Trophy, AlertCircle } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { getTasks } from "@/src/lib/learning";

// ─── Timer helpers ────────────────────────────────────────────────────────────
/** Seconds allowed per question — scales with count but caps at 2 min/question. */
function calcTimeLimit(questionCount: number): number {
  return Math.min(questionCount * 90, questionCount * 120); // 90 s per question
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type QuizState = "idle" | "generated" | "submitted";

interface Task { _id: string; title: string; status: string }

// ─────────────────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [topic, setTopic]         = useState("");
  const [quiz, setQuiz]           = useState<any>(null);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [score, setScore]         = useState<any>(null);
  const [state, setState]         = useState<QuizState>("idle");
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft]   = useState(0);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Task suggestions
  const [tasks, setTasks]         = useState<Task[]>([]);
  const toast = useToast();

  // Load learning tasks for topic suggestions
  useEffect(() => {
    getTasks()
      .then((data: Task[]) => setTasks(data.filter((t) => t.status !== "completed").slice(0, 6)))
      .catch(() => {});
  }, []);

  // ── Timer management ────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // answers ref so the auto-submit callback always sees latest answers
  const answersRef = useRef<Record<string, string>>({});
  answersRef.current = answers;

  const quizRef = useRef<any>(null);
  quizRef.current = quiz;

  const doSubmit = useCallback(async (expired: boolean) => {
    if (submitting) return;
    stopTimer();
    if (expired) setTimeExpired(true);

    const currentQuiz    = quizRef.current;
    const currentAnswers = answersRef.current;
    if (!currentQuiz) return;

    setSubmitting(true);
    try {
      const formattedAnswers = currentQuiz.questions.map((q: any) => ({
        questionId: q._id,
        answer: currentAnswers[q._id] ?? "",
      }));
      const response = await api.put(`/quiz/${currentQuiz._id}/submit`, { answers: formattedAnswers });
      setScore(response.data);
      setState("submitted");
    } catch {
      toast.error("Submit failed", "Could not submit your quiz.");
    } finally {
      setSubmitting(false);
    }
  }, [submitting, stopTimer, toast]);

  // Start timer when quiz is generated
  const startTimer = useCallback((seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired — auto-submit
          doSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer, doSubmit]);

  // Clean up timer on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  // ── Quiz generation ─────────────────────────────────────────────────────────
  const generateQuiz = async (topicOverride?: string) => {
    const t = (topicOverride ?? topic).trim();
    if (!t) { toast.warning("Topic required", "Enter a topic to generate a quiz."); return; }
    setTopic(t);
    setGenerating(true);
    stopTimer();
    try {
      const response = await api.post("/quiz", { topic: t });
      const q = response.data;
      setQuiz(q);
      setAnswers({});
      setScore(null);
      setTimeExpired(false);
      setState("generated");
      // Start countdown: 90 s per question
      const limit = calcTimeLimit(q.questions?.length ?? 10);
      startTimer(limit);
      toast.success("Quiz ready!", `${q.questions?.length} questions — ${Math.round(limit / 60)} min time limit.`);
    } catch {
      toast.error("Generation failed", "Could not generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleManualSubmit = async () => {
    const unanswered = quiz.questions.filter((q: any) => !answers[q._id]);
    if (unanswered.length > 0) {
      toast.warning("Incomplete quiz", `${unanswered.length} question(s) still unanswered.`);
      return;
    }
    await doSubmit(false);
  };

  const resetQuiz = () => {
    stopTimer();
    setState("idle");
    setQuiz(null);
    setTopic("");
    setScore(null);
    setTimeExpired(false);
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount    = quiz?.questions?.length ?? 0;
  const scorePercent  = score && score.totalQuestions > 0
    ? Math.round((score.score / score.totalQuestions) * 100) : 0;

  // Timer colour
  const timerColor =
    timeLeft > 60 ? "text-success" :
    timeLeft > 30 ? "text-warning" :
    "text-danger";

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Zap size={22} className="text-amber-500" />
            Practice Quiz
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Generate a timed quiz on any topic to test your knowledge
          </p>
        </div>
        <Link href="/quiz/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      {/* Topic input */}
      {state === "idle" && (
        <Card>
          <CardHeader><CardTitle>Quiz Topic</CardTitle></CardHeader>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. React Hooks, Python Decorators, Machine Learning"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
                leftIcon={<Zap size={14} />}
              />
            </div>
            <Button onClick={() => generateQuiz()} loading={generating} leftIcon={<Sparkles size={14} />}>
              {generating ? "Generating…" : "Generate"}
            </Button>
          </div>

          {/* Task-based suggestions */}
          {tasks.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                From your learning tasks
              </p>
              <div className="flex flex-wrap gap-2">
                {tasks.map((t) => (
                  <button key={t._id}
                    onClick={() => generateQuiz(t.title)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors font-medium">
                    {t.title.length > 36 ? t.title.slice(0, 36) + "…" : t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Generating skeleton */}
      {generating && (
        <Card className="py-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
            <p className="text-sm text-text-secondary">Generating your quiz…</p>
          </div>
        </Card>
      )}

      {/* Score result */}
      {state === "submitted" && score && (
        <Card className="text-center py-8">
          {timeExpired && (
            <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 max-w-xs mx-auto">
              <AlertCircle size={15} />
              Time expired. Your quiz was submitted with the answers you completed.
            </div>
          )}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-amber-500" />
          </div>
          <p className="text-5xl font-bold text-text-primary tabular-nums mb-1">
            {score.score}/{score.totalQuestions}
          </p>
          <p className="text-text-secondary text-sm mb-4">{scorePercent}% correct</p>
          <div className="max-w-xs mx-auto mb-6">
            <ProgressBar value={scorePercent}
              color={scorePercent >= 70 ? "success" : scorePercent >= 40 ? "warning" : "danger"}
              size="lg" showLabel />
          </div>
          <Badge variant={scorePercent >= 70 ? "success" : scorePercent >= 40 ? "warning" : "danger"}>
            {scorePercent >= 70 ? "Excellent!" : scorePercent >= 40 ? "Good effort" : "Keep practising"}
          </Badge>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={resetQuiz}>New Quiz</Button>
            <Link href="/quiz/history"><Button variant="secondary">View History</Button></Link>
          </div>
        </Card>
      )}

      {/* Active quiz */}
      {quiz && state === "generated" && (
        <div className="space-y-4">
          {/* Quiz header + timer */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Badge variant="brand">{quiz.topic}</Badge>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-muted">{answeredCount}/{totalCount} answered</span>
              {/* Countdown timer */}
              <div className={["flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums", timerColor].join(" ")}>
                <Clock size={14} />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <ProgressBar value={answeredCount} max={totalCount} color="brand" size="sm" />

          {/* Timer warning */}
          {timeLeft <= 30 && timeLeft > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-danger-bg border border-red-200 rounded-lg text-sm text-danger">
              <AlertCircle size={14} />
              {timeLeft}s remaining — submit now or it will auto-submit!
            </div>
          )}

          {quiz.questions.map((question: any, index: number) => (
            <Card key={question._id}>
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="font-medium text-text-primary text-sm leading-relaxed">{question.question}</p>
              </div>
              <div className="space-y-2 ml-10">
                {question.options.map((option: string, oi: number) => {
                  const isSelected = answers[question._id] === option;
                  return (
                    <label key={oi}
                      className={[
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150",
                        isSelected
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-border hover:border-brand-300 hover:bg-surface-3",
                      ].join(" ")}>
                      <input type="radio" name={question._id} value={option} checked={isSelected}
                        onChange={() => handleAnswer(question._id, option)} className="sr-only" />
                      <div className={["w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                        isSelected ? "border-brand-600" : "border-slate-300"].join(" ")}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                      </div>
                      <span className="text-sm break-words min-w-0">{option}</span>
                    </label>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-2">
            <p className="text-sm text-text-secondary">
              {answeredCount < totalCount
                ? `${totalCount - answeredCount} question(s) remaining`
                : "All questions answered — ready to submit!"}
            </p>
            <Button onClick={handleManualSubmit} loading={submitting}
              leftIcon={<CheckCircle2 size={14} />} disabled={answeredCount === 0}>
              Submit Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Idle empty state */}
      {state === "idle" && !generating && (
        <Card className="text-center py-14">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <Zap size={32} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to test your knowledge?</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter any topic above to generate a multiple-choice quiz with a countdown timer.
          </p>
        </Card>
      )}
    </div>
  );
}

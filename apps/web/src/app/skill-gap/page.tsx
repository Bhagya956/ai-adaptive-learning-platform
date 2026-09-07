"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target, Sparkles, Clock, CheckCircle, AlertCircle,
  ChevronRight, TrendingUp, BookOpen, XCircle,
} from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { InlineLoader } from "@/src/components/ui/LoadingSpinner";

// ─── Markdown parser (kept for full analysis section) ─────────────────────────
function parseSkillGapText(text: string) {
  if (!text) return null;
  const sections: { title: string; items: string[]; type: "positive" | "negative" | "neutral" }[] = [];
  let current: { title: string; items: string[]; type: "positive" | "negative" | "neutral" } | null = null;

  const getType = (title: string): "positive" | "negative" | "neutral" => {
    const t = title.toLowerCase();
    if (t.includes("missing") || t.includes("gap") || t.includes("weak") || t.includes("lack")) return "negative";
    if (t.includes("current") || t.includes("existing") || t.includes("strength") || t.includes("present")) return "positive";
    return "neutral";
  };

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const isHeader =
      trimmed.startsWith("##") ||
      trimmed.startsWith("**") ||
      (trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("-"));
    if (isHeader) {
      if (current) sections.push(current);
      const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
      current = { title, items: [], type: getType(title) };
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.match(/^\d+\./)) {
      const item = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (current && item) current.items.push(item);
    } else if (current) {
      current.items.push(trimmed);
    }
  });
  if (current) sections.push(current);
  return sections.filter((s) => s.items.length > 0);
}

// ─── Extract current skills from analysis markdown ────────────────────────────
function extractCurrentSkills(text: string): string[] {
  const skills: string[] = [];
  let inCurrentSection = false;

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    const isHeader =
      trimmed.startsWith("##") || trimmed.startsWith("**") ||
      (trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("-"));

    if (isHeader) {
      const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").toLowerCase();
      inCurrentSection = title.includes("current") || title.includes("existing") || title.includes("you have") || title.includes("strength");
    } else if (inCurrentSection && (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.match(/^\d+\./))) {
      const item = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (item) skills.push(item);
    }
  });

  return skills;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SkillGapPage() {
  const [targetRole, setTargetRole]       = useState("");
  const [analysis, setAnalysis]           = useState("");
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const toast = useToast();

  const generateAnalysis = async () => {
    if (!targetRole.trim()) {
      toast.warning("Target role required", "Enter the role you want to analyse skills for.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/skill-gap", { targetRole });
      setAnalysis(response.data.analysis ?? "");
      setMissingSkills(response.data.missingSkills ?? []);
      setRecommendations(response.data.recommendations ?? []);
      toast.success("Analysis complete!", "Your skill gap report is ready.");
    } catch {
      toast.error("Analysis failed", "Could not analyse skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = parseSkillGapText(analysis);
  const currentSkills = extractCurrentSkills(analysis);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target size={22} className="text-rose-600" />
            Skill Gap Analysis
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Discover the gap between your current skills and your target role
          </p>
        </div>
        <Link href="/skill-gap/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Target Role</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Enter the role you're aiming for — your saved profile skills will be compared against it
          </p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. Full Stack Developer, Data Scientist, UX Designer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateAnalysis()}
              leftIcon={<Target size={14} />}
            />
          </div>
          <Button onClick={generateAnalysis} loading={loading} leftIcon={<Sparkles size={14} />}>
            {loading ? "Analysing…" : "Analyse"}
          </Button>
        </div>
      </Card>

      {/* Loading */}
      {loading && <InlineLoader message="Analysing your skills against the target role…" />}

      {/* Empty state */}
      {!analysis && !loading && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <Target size={32} className="text-rose-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to find your gaps?</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter your target role above and the system will compare it against your current skills and profile.
          </p>
        </Card>
      )}

      {/* ── Structured summary ── */}
      {analysis && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">Analysis Complete</Badge>
              <Badge variant="default">{targetRole}</Badge>
            </div>
            <Button onClick={generateAnalysis} variant="outline" size="sm" leftIcon={<Sparkles size={13} />}>
              Re-analyse
            </Button>
          </div>

          {/* 3-column summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current skills */}
            <Card className="border-l-4 border-l-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle size={15} /> Current Skills
                </CardTitle>
              </CardHeader>
              {currentSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-success-bg border border-green-200 text-success">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">Update your profile with current skills for a more accurate analysis.</p>
              )}
            </Card>

            {/* Missing skills */}
            <Card className="border-l-4 border-l-danger">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger">
                  <XCircle size={15} /> Missing Skills
                </CardTitle>
              </CardHeader>
              {missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map((s, i) => (
                    <span key={i} className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-danger-bg border border-red-200 text-danger">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted">No specific missing skills identified — see the full analysis below.</p>
              )}
            </Card>

            {/* Recommendations */}
            <Card className="border-l-4 border-l-brand-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-600">
                  <TrendingUp size={15} /> Recommended Next Steps
                </CardTitle>
              </CardHeader>
              {recommendations.length > 0 ? (
                <ul className="space-y-1.5">
                  {recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                      <ChevronRight size={12} className="text-brand-400 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-text-muted">See the full analysis below for detailed recommendations.</p>
              )}
            </Card>
          </div>

          {/* Full analysis breakdown */}
          {sections && sections.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-2">
                <BookOpen size={13} /> Full Analysis
              </h2>
              <div className="space-y-3">
                {sections.map((section, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {section.type === "positive" ? (
                          <CheckCircle size={15} className="text-success" />
                        ) : section.type === "negative" ? (
                          <AlertCircle size={15} className="text-danger" />
                        ) : (
                          <ChevronRight size={15} className="text-brand-600" />
                        )}
                        <CardTitle>{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((item, j) => (
                        <span key={j} className={[
                          "inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border",
                          section.type === "positive"
                            ? "bg-success-bg border-green-200 text-success"
                            : section.type === "negative"
                            ? "bg-danger-bg border-red-200 text-danger"
                            : "bg-surface-3 border-border text-text-secondary",
                        ].join(" ")}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

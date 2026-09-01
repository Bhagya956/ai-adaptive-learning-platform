"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, Sparkles, Clock, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";

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

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const generateAnalysis = async () => {
    if (!targetRole.trim()) {
      toast.warning("Target role required", "Enter the role you want to analyze skills for.");
      return;
    }
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/skill-gap", { targetRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysis(response.data.analysis);
      toast.success("Analysis complete!", "Your skill gap report is ready.");
    } catch {
      toast.error("Analysis failed", "Could not analyze skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = parseSkillGapText(analysis);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target size={22} className="text-rose-600" />
            Skill Gap Analyzer
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Discover exactly what skills you need to bridge the gap to your target role
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
            Enter the role you're aiming for and AI will compare it against your profile
          </p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateAnalysis()}
              leftIcon={<Target size={14} />}
            />
          </div>
          <Button onClick={generateAnalysis} loading={loading} leftIcon={<Sparkles size={14} />}>
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
      </Card>

      {/* Empty */}
      {!analysis && !loading && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <Target size={32} className="text-rose-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to find your gaps?</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter your target role above. AI will compare your current skills against what's required.
          </p>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin" />
            <p className="text-sm text-text-secondary">Analyzing your skills…</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {analysis && !loading && sections && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="success">Analysis Complete — {targetRole}</Badge>
            <Button onClick={generateAnalysis} variant="outline" size="sm" leftIcon={<Sparkles size={13} />}>
              Re-analyze
            </Button>
          </div>

          {sections.map((section, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {section.type === "positive" ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : section.type === "negative" ? (
                    <AlertCircle size={16} className="text-danger" />
                  ) : (
                    <ChevronRight size={16} className="text-brand-600" />
                  )}
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, j) => (
                  <span
                    key={j}
                    className={[
                      "inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border",
                      section.type === "positive"
                        ? "bg-success-bg text-success border-green-200"
                        : section.type === "negative"
                        ? "bg-danger-bg text-danger border-red-200"
                        : "bg-surface-3 text-text-secondary border-border",
                    ].join(" ")}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fallback raw */}
      {analysis && !loading && !sections?.length && (
        <Card>
          <CardHeader><CardTitle>Skill Gap Analysis</CardTitle></CardHeader>
          <pre className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed font-sans">{analysis}</pre>
        </Card>
      )}
    </div>
  );
}

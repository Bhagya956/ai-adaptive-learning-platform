"use client";

import { useState } from "react";
import Link from "next/link";
import { Mic2, Sparkles, Clock, ChevronRight } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";

function parseGuideText(text: string | undefined | null) {
  if (!text || typeof text !== "string") return [];
  const sections: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;
  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const isHeader =
      trimmed.startsWith("##") ||
      trimmed.startsWith("**") ||
      (trimmed.endsWith(":") && trimmed.length < 80 && !trimmed.startsWith("-"));
    if (isHeader) {
      if (current) sections.push(current);
      const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
      current = { title, items: [] };
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.match(/^\d+\./)) {
      const item = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (current && item) current.items.push(item);
      else if (!current && item) current = { title: "Guide", items: [item] };
    } else if (current) {
      current.items.push(trimmed);
    }
  });
  if (current) sections.push(current);
  return sections.filter((s) => s.items.length > 0);
}

const sectionColors = [
  "border-l-brand-500",
  "border-l-blue-500",
  "border-l-violet-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
];

export default function InterviewPrepPage() {
  const [targetRole, setTargetRole] = useState("");
  const [guide, setGuide] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const generateGuide = async () => {
    if (!targetRole.trim()) {
      toast.warning("Role required", "Enter the role you are preparing for.");
      return;
    }
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/interview-prep", { targetRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuide(response.data.preparation ?? response.data.guide ?? "");
      toast.success("Guide ready!", "Your interview prep guide has been generated.");
    } catch {
      toast.error("Generation failed", "Could not generate guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = parseGuideText(guide);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Mic2 size={22} className="text-green-600" />
            Interview Preparation
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            AI-generated interview guide with questions, tips, and strategies for any role
          </p>
        </div>
        <Link href="/interview-prep/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Target Role</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Enter the job role you are interviewing for</p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. Frontend Developer, Product Manager, Data Analyst"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateGuide()}
              leftIcon={<Mic2 size={14} />}
            />
          </div>
          <Button onClick={generateGuide} loading={loading} leftIcon={<Sparkles size={14} />}>
            {loading ? "Generating…" : "Generate Guide"}
          </Button>
        </div>
      </Card>

      {!guide && !loading && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
            <Mic2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Ready to prepare?</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter your target role and get a comprehensive interview preparation guide with
            questions, answers, and tips.
          </p>
        </Card>
      )}

      {loading && (
        <Card className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
            <p className="text-sm text-text-secondary">Generating your interview guide…</p>
          </div>
        </Card>
      )}

      {guide && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="success">Guide Ready — {targetRole}</Badge>
            <Button onClick={generateGuide} variant="outline" size="sm" leftIcon={<Sparkles size={13} />}>
              Regenerate
            </Button>
          </div>

          {sections.length > 0 ? (
            sections.map((section, i) => (
              <Card
                key={i}
                className={`border-l-4 ${sectionColors[i % sectionColors.length]}`}
              >
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      <ChevronRight size={14} className="text-brand-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))
          ) : (
            <Card>
              <pre className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed font-sans">{guide}</pre>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

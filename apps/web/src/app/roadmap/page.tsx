"use client";

import { useState } from "react";
import Link from "next/link";
import { Map, Sparkles, Clock, ArrowRight, ChevronRight } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";

function parseRoadmapText(text: string): { title: string; items: string[] }[] {
  if (!text) return [];
  const sections: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;

  text.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect section headers: lines starting with ## or ** or all caps phrases
    const isHeader =
      trimmed.startsWith("##") ||
      trimmed.startsWith("**") ||
      (trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("-"));

    if (isHeader) {
      if (current) sections.push(current);
      const title = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim();
      current = { title, items: [] };
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.match(/^\d+\./)) {
      const item = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (current && item) current.items.push(item);
      else if (!current && item) {
        current = { title: "Roadmap", items: [item] };
      }
    } else if (current) {
      // Plain text under a section
      current.items.push(trimmed);
    } else {
      current = { title: "Overview", items: [trimmed] };
    }
  });

  if (current) sections.push(current);
  return sections.filter((s) => s.items.length > 0);
}

const stageColors = [
  "bg-brand-600",
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-rose-600",
  "bg-cyan-600",
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/ai/roadmap", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoadmap(response.data.roadmap);
      toast.success("Roadmap generated!", "Your personalized career roadmap is ready.");
    } catch {
      toast.error("Generation failed", "Could not generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = parseRoadmapText(roadmap);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Map size={22} className="text-brand-600" />
            AI Career Roadmap
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Get a personalized step-by-step roadmap based on your profile and career goals
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/roadmap/history">
            <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>
              History
            </Button>
          </Link>
          <Button
            onClick={generateRoadmap}
            loading={loading}
            leftIcon={<Sparkles size={14} />}
          >
            {loading ? "Generating…" : "Generate Roadmap"}
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {!roadmap && !loading && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <Map size={32} className="text-brand-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            No roadmap generated yet
          </h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
            Click "Generate Roadmap" and AI will create a personalized career path
            based on your profile, skills, and goals.
          </p>
          <Button onClick={generateRoadmap} loading={loading} leftIcon={<Sparkles size={14} />}>
            Generate My Roadmap
          </Button>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
            <p className="text-sm text-text-secondary">
              AI is building your personalized roadmap…
            </p>
          </div>
        </Card>
      )}

      {/* Rendered roadmap */}
      {roadmap && !loading && sections.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="success">Roadmap Generated</Badge>
            <Button
              onClick={generateRoadmap}
              variant="outline"
              size="sm"
              leftIcon={<Sparkles size={13} />}
            >
              Regenerate
            </Button>
          </div>

          {/* Stage timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border hidden md:block" />

            <div className="space-y-4">
              {sections.map((section, i) => (
                <div key={i} className="flex gap-4">
                  {/* Step indicator */}
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${stageColors[i % stageColors.length]} text-white text-sm font-bold flex items-center justify-center shadow-sm z-10`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Content */}
                  <Card className="flex-1">
                    <div className="flex items-start gap-3">
                      <div
                        className={`md:hidden w-8 h-8 rounded-lg ${stageColors[i % stageColors.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-3">
                          {section.title}
                        </h3>
                        <ul className="space-y-1.5">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                              <ChevronRight size={14} className="text-brand-400 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fallback: raw text if parsing yielded no sections */}
      {roadmap && !loading && sections.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Roadmap</CardTitle>
          </CardHeader>
          <pre className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed font-sans">
            {roadmap}
          </pre>
        </Card>
      )}
    </div>
  );
}

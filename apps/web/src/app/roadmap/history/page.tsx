"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, ArrowLeft, ChevronRight, Calendar } from "lucide-react";
import { getRoadmapHistory } from "@/src/lib/roadmap";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

function parseRoadmapSections(text: string): string[] {
  return text
    .split("\n")
    .filter((l) => l.trim().startsWith("##") || (l.trim().startsWith("**") && l.trim().endsWith("**")))
    .map((l) => l.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/:$/, "").trim())
    .slice(0, 6);
}

export default function RoadmapHistoryPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getRoadmapHistory()
      .then(setRoadmaps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading roadmap history…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/roadmap">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Map size={20} className="text-indigo-600" />
            Roadmap History
          </h1>
          <p className="text-text-secondary text-sm">All your previously generated career roadmaps</p>
        </div>
      </div>

      {roadmaps.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No roadmaps yet"
          description="Generate your first AI career roadmap."
          action={{ label: "Generate Roadmap", onClick: () => window.location.href = "/roadmap" }}
        />
      ) : (
        <div className="space-y-3">
          {roadmaps.map((item: any) => {
            const sections = parseRoadmapSections(item.roadmap || "");
            const isExpanded = expanded === item._id;
            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={13} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </span>
                    </div>
                    {sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {sections.map((s, i) => (
                          <Badge key={i} variant="default" size="sm">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item._id)}
                    className="text-xs text-brand-600 font-medium flex items-center gap-1 shrink-0 hover:text-brand-700"
                  >
                    {isExpanded ? "Collapse" : "View"}
                    <ChevronRight size={12} className={isExpanded ? "rotate-90" : ""} />
                  </button>
                </div>
                {isExpanded && (
                  <pre className="whitespace-pre-wrap text-xs text-text-secondary leading-relaxed font-sans mt-3 pt-3 border-t border-border max-h-80 overflow-y-auto">
                    {item.roadmap}
                  </pre>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

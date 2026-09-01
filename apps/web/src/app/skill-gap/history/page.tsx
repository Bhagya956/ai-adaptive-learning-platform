"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Target, ArrowLeft, Calendar, ChevronRight } from "lucide-react";
import { getSkillGapHistory } from "@/src/lib/skillgap";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function SkillGapHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getSkillGapHistory()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading skill gap history…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/skill-gap">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target size={20} className="text-rose-600" />
            Skill Gap History
          </h1>
          <p className="text-text-secondary text-sm">All your previous skill gap analyses</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No analyses yet"
          description="Analyze your skill gap against a target role."
          action={{ label: "Analyze Skills", onClick: () => window.location.href = "/skill-gap" }}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const isExpanded = expanded === item._id;
            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center font-medium rounded-full text-xs px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200">
                        {item.targetRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Calendar size={11} />
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : item._id)}
                    className="text-xs text-brand-600 font-medium flex items-center gap-1 shrink-0"
                  >
                    {isExpanded ? "Collapse" : "View"}
                    <ChevronRight size={12} className={isExpanded ? "rotate-90" : ""} />
                  </button>
                </div>
                {isExpanded && (
                  <pre className="whitespace-pre-wrap text-xs text-text-secondary leading-relaxed font-sans mt-3 pt-3 border-t border-border max-h-80 overflow-y-auto">
                    {item.analysis}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Calendar, Star } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/resume/history").then((r) => setResumes(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading resume history…" />;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/resume">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />}>Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Resume History
          </h1>
          <p className="text-text-secondary text-sm">All your previous resume analyses</p>
        </div>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No analyses yet"
          description="Upload your resume to get your first AI analysis."
          action={{ label: "Analyze Resume", onClick: () => window.location.href = "/resume" }}
        />
      ) : (
        <div className="space-y-3">
          {resumes.map((item: any) => {
            let analysis: any = null;
            try {
              const raw = (item.analysis || "").replace(/```json/g, "").replace(/```/g, "").trim();
              if (raw.startsWith("{")) analysis = JSON.parse(raw);
            } catch { /* ignore */ }

            const score = analysis?.score ?? null;
            const color = score !== null
              ? score >= 75 ? "success" : score >= 50 ? "warning" : "danger"
              : "default";

            return (
              <Card key={item._id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={13} className="text-text-muted" />
                      <span className="text-xs text-text-muted">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "long", day: "numeric",
                        })}
                      </span>
                    </div>
                    {analysis && (
                      <>
                        {analysis.recommendedRoles?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {analysis.recommendedRoles.slice(0, 3).map((r: string, i: number) => (
                              <Badge key={i} variant="brand" size="sm">{r}</Badge>
                            ))}
                          </div>
                        )}
                        {analysis.missingSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingSkills.slice(0, 4).map((s: string, i: number) => (
                              <Badge key={i} variant="danger" size="sm">{s}</Badge>
                            ))}
                            {analysis.missingSkills.length > 4 && (
                              <span className="text-xs text-text-muted self-center">
                                +{analysis.missingSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {score !== null && (
                    <div className="text-center shrink-0">
                      <p className={`text-2xl font-bold tabular-nums ${color === "success" ? "text-success" : color === "warning" ? "text-warning" : "text-danger"}`}>
                        {score}
                      </p>
                      <p className="text-[10px] text-text-muted">/100</p>
                      <div className="w-16 mt-2">
                        <ProgressBar value={score} color={color as any} size="sm" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

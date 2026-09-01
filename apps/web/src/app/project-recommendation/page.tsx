"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Sparkles, Code2, ChevronRight } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader, InlineLoader } from "@/src/components/ui/LoadingSpinner";

const difficultyVariant = (d: string) => {
  switch (d?.toLowerCase()) {
    case "beginner": return "success" as const;
    case "intermediate": return "warning" as const;
    case "advanced": return "danger" as const;
    default: return "default" as const;
  }
};

export default function ProjectRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [latestRec, setLatestRec] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const response = await api.post("/project-recommendation");
      setLatestRec(response.data);
      fetchHistory();
      toast.success("Projects generated!", "AI has recommended projects based on your profile.");
    } catch {
      toast.error("Generation failed", "Could not generate project recommendations.");
    } finally {
      setGenerating(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get("/project-recommendation/history");
      setHistory(response.data);
      if (response.data.length > 0) setLatestRec(response.data[0]);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading recommendations…" />;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FolderKanban size={22} className="text-violet-600" />
            AI Project Recommendations
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Build real-world projects to strengthen your portfolio and close skill gaps
          </p>
        </div>
        <Button onClick={generateRecommendations} loading={generating} leftIcon={<Sparkles size={14} />}>
          {generating ? "Generating…" : "Generate Projects"}
        </Button>
      </div>

      {generating && <InlineLoader message="AI is finding the best projects for you…" />}

      {latestRec ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="brand">Latest Recommendations</Badge>
            <span className="text-xs text-text-muted">
              {latestRec.recommendations?.length ?? 0} projects
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestRec.recommendations?.map((project: any, i: number) => (
              <Card key={i} hover className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Code2 size={18} className="text-violet-600" />
                  </div>
                  <Badge variant={difficultyVariant(project.difficulty)} size="sm">
                    {project.difficulty}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-2">{project.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                    Skills involved
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills?.map((skill: string, j: number) => (
                      <Badge key={j} variant="default" size="sm">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
            <FolderKanban size={32} className="text-violet-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">No recommendations yet</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6">
            Generate AI project recommendations based on your career goals and current skills.
          </p>
          <Button onClick={generateRecommendations} loading={generating} leftIcon={<Sparkles size={14} />}>
            Generate Projects
          </Button>
        </Card>
      )}

      {/* History */}
      {history.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Recommendation History</CardTitle></CardHeader>
          <div className="space-y-2">
            {history.slice(1).map((item: any) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-text-muted" />
                  <span className="text-sm text-text-secondary">{item.careerGoal || "General"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" size="sm">
                    {item.recommendations?.length ?? 0} projects
                  </Badge>
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

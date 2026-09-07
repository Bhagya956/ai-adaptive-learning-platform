"use client";

import { useEffect, useState } from "react";
import {
  Layers, Sparkles, BookOpen, PlaySquare, Monitor,
  FolderKanban, GraduationCap, ExternalLink, Clock,
  BookMarked,
} from "lucide-react";
import api from "@/src/services/api";
import { getTasks } from "@/src/lib/learning";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader, InlineLoader } from "@/src/components/ui/LoadingSpinner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResourceItem { name: string; description: string; url: string }
interface ResourceDoc {
  _id: string;
  skill: string;
  documentation: ResourceItem[];
  youtube: ResourceItem[];
  practicePlatforms: ResourceItem[];
  projectIdeas: ResourceItem[];
  courses: ResourceItem[];
  createdAt: string;
}

interface LearningTask { _id: string; title: string; status: string }

const resourceCategories: {
  key: keyof Omit<ResourceDoc, "_id" | "skill" | "createdAt">;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { key: "documentation",     label: "Documentation",     icon: BookOpen,      color: "text-blue-600",   bg: "bg-blue-50"   },
  { key: "youtube",           label: "Video Resources",   icon: PlaySquare,    color: "text-red-600",    bg: "bg-red-50"    },
  { key: "practicePlatforms", label: "Practice",          icon: Monitor,       color: "text-green-600",  bg: "bg-green-50"  },
  { key: "projectIdeas",      label: "Project Ideas",     icon: FolderKanban,  color: "text-violet-600", bg: "bg-violet-50" },
  { key: "courses",           label: "Courses",           icon: GraduationCap, color: "text-amber-600",  bg: "bg-amber-50"  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function ResourceRecommendationPage() {
  const [skill, setSkill]           = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [latestResource, setLatestResource] = useState<ResourceDoc | null>(null);
  const [history, setHistory]       = useState<ResourceDoc[]>([]);
  const [tasks, setTasks]           = useState<LearningTask[]>([]);
  const toast = useToast();

  useEffect(() => {
    Promise.all([fetchHistory(), fetchTasks()]).finally(() => setInitialLoading(false));
  }, []);

  const fetchHistory = async () => {
    try {
      const r = await api.get("/resource-recommendation/history");
      const data: ResourceDoc[] = r.data;
      setHistory(data);
      if (data.length > 0) setLatestResource(data[0]);
    } catch {
      // silent — not a critical failure
    }
  };

  const fetchTasks = async () => {
    try {
      const data: LearningTask[] = await getTasks();
      // Show open + wip tasks as topic suggestions
      setTasks(data.filter((t) => t.status !== "completed").slice(0, 8));
    } catch {
      // silent
    }
  };

  const generateResources = async (topicOverride?: string) => {
    const topic = (topicOverride ?? skill).trim();
    if (!topic) {
      toast.warning("Topic required", "Enter a skill or topic to find resources.");
      return;
    }
    setSkill(topic);
    setGenerating(true);
    try {
      const r = await api.post("/resource-recommendation", { skill: topic });
      setLatestResource(r.data);
      fetchHistory();
      toast.success("Resources found!", `Resources for "${topic}" are ready.`);
    } catch {
      toast.error("Failed", "Could not generate resources. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (initialLoading) return <PageLoader message="Loading resources…" />;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Layers size={22} className="text-blue-600" />
          Learning Resources
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Find curated documentation, videos, courses and project ideas for any topic
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find Resources</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Enter any skill, subject, or topic — not just software
          </p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. Digital Marketing, Data Analysis, React, Finance…"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateResources()}
              leftIcon={<Layers size={14} />}
            />
          </div>
          <Button onClick={() => generateResources()} loading={generating} leftIcon={<Sparkles size={14} />}>
            {generating ? "Finding…" : "Find Resources"}
          </Button>
        </div>

        {/* Task-based suggestions (primary) */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookMarked size={12} /> From your learning tasks
            </p>
            <div className="flex flex-wrap gap-2">
              {tasks.map((t) => (
                <button
                  key={t._id}
                  onClick={() => generateResources(t.title)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors font-medium"
                >
                  {t.title.length > 40 ? t.title.slice(0, 40) + "…" : t.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fallback suggestions only when no tasks exist */}
        {tasks.length === 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Digital Marketing", "Data Analysis", "Python", "React",
                "Communication Skills", "Finance Fundamentals", "SQL", "Project Management",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => generateResources(s)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-3 border border-border text-text-secondary hover:border-brand-300 hover:text-brand-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {generating && <InlineLoader message="Curating the best resources for you…" />}

      {/* Results */}
      {latestResource && !generating && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{latestResource.skill}</Badge>
            <span className="text-xs text-text-muted">Resources</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceCategories.map(({ key, label, icon: Icon, color, bg }) => {
              const items: ResourceItem[] = (latestResource as any)[key] ?? [];
              if (items.length === 0) return null;
              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={16} className={color} />
                      </div>
                      <CardTitle>{label}</CardTitle>
                    </div>
                  </CardHeader>
                  <ul className="space-y-3">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ExternalLink size={12} className="text-text-muted mt-1 shrink-0" />
                        <div className="min-w-0">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline leading-snug break-words">
                              {item.name}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-text-primary leading-snug">{item.name}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!latestResource && !generating && (
        <Card className="text-center py-14">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <Layers size={32} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Find resources for any topic</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Search a skill or select from your learning tasks above to get curated resources.
          </p>
        </Card>
      )}

      {/* Search history */}
      {history.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={15} className="text-text-muted" />
              Previous Searches
            </CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {history.slice(1, 12).map((item) => (
              <button key={item._id}
                onClick={() => generateResources(item.skill)}
                className="text-xs px-3 py-1.5 rounded-full bg-surface-3 border border-border text-text-secondary hover:border-brand-300 hover:text-brand-600 transition-colors">
                {item.skill}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

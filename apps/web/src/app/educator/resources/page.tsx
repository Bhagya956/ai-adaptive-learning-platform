"use client";

import { useEffect, useState } from "react";
import {
  Layers, Sparkles, BookOpen, PlaySquare,
  Monitor, FolderKanban, GraduationCap, ExternalLink,
} from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader, InlineLoader } from "@/src/components/ui/LoadingSpinner";

interface ResourceItem {
  name: string;
  description: string;
  url: string;
}

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

const resourceCategories: {
  key: keyof Omit<ResourceDoc, "_id" | "skill" | "createdAt">;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { key: "documentation",     label: "Documentation",     icon: BookOpen,      color: "text-blue-600",   bg: "bg-blue-50"   },
  { key: "youtube",           label: "YouTube",            icon: PlaySquare,    color: "text-red-600",    bg: "bg-red-50"    },
  { key: "practicePlatforms", label: "Practice Platforms", icon: Monitor,       color: "text-green-600",  bg: "bg-green-50"  },
  { key: "projectIdeas",      label: "Project Ideas",      icon: FolderKanban,  color: "text-violet-600", bg: "bg-violet-50" },
  { key: "courses",           label: "Courses",            icon: GraduationCap, color: "text-amber-600",  bg: "bg-amber-50"  },
];

export default function EducatorResourcesPage() {
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [latestResource, setLatestResource] = useState<ResourceDoc | null>(null);
  const [history, setHistory] = useState<ResourceDoc[]>([]);
  const toast = useToast();

  useEffect(() => { fetchHistory(); }, []);

  const generateResources = async () => {
    if (!skill.trim()) {
      toast.warning("Skill required", "Enter a skill to find resources.");
      return;
    }
    setGenerating(true);
    try {
      const r = await api.post("/resource-recommendation", { skill });
      setLatestResource(r.data);
      fetchHistory();
      toast.success("Resources ready!", `Resources for "${skill}" loaded.`);
    } catch {
      toast.error("Failed", "Could not generate resources. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const r = await api.get("/resource-recommendation/history");
      setHistory(r.data);
      if (r.data.length > 0) setLatestResource(r.data[0]);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading resources…" />;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Layers size={22} className="text-blue-600" />
          Learning Resources
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Find AI-curated resources to recommend to your learners or use in your teaching
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Search by Skill or Topic</CardTitle></CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. React, Python, Machine Learning, Docker"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateResources()}
              leftIcon={<Layers size={14} />}
            />
          </div>
          <Button onClick={generateResources} loading={generating} leftIcon={<Sparkles size={14} />}>
            {generating ? "Finding…" : "Find Resources"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {["React", "Python", "Node.js", "TypeScript", "MongoDB", "Docker", "Data Science"].map((s) => (
            <button
              key={s}
              onClick={() => setSkill(s)}
              className="text-xs px-2.5 py-1 rounded-full bg-surface-3 border border-border text-text-secondary hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </Card>

      {generating && <InlineLoader message="Curating the best resources…" />}

      {latestResource && !generating && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{latestResource.skill}</Badge>
            <span className="text-xs text-text-muted">Resources</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceCategories.map(({ key, label, icon: Icon, color, bg }) => {
              const items: ResourceItem[] = latestResource[key] ?? [];
              if (items.length === 0) return null;
              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
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
                              className="text-sm font-medium text-brand-600 hover:underline break-words">
                              {item.name}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-text-primary">{item.name}</p>
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
          <h2 className="text-lg font-semibold text-text-primary mb-2">Find resources for your learners</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Search any skill or topic to get curated documentation, videos, courses, and project ideas.
          </p>
        </Card>
      )}

      {history.length > 1 && (
        <Card>
          <CardHeader><CardTitle>Recent Searches</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {history.slice(1, 10).map((item) => (
              <button key={item._id} onClick={() => setSkill(item.skill)}
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

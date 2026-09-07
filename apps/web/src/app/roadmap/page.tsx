"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, Sparkles, Clock, ChevronRight, User, Briefcase, Edit3 } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

// ─── Parse roadmap markdown ──────────────────────────────────────────────────
function parseRoadmapText(text: string): { title: string; items: string[] }[] {
  if (!text) return [];
  const sections: { title: string; items: string[] }[] = [];
  let current: { title: string; items: string[] } | null = null;

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
      current = { title, items: [] };
    } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.match(/^\d+\./)) {
      const item = trimmed.replace(/^[-•]\s*/, "").replace(/^\d+\.\s*/, "").trim();
      if (current && item) current.items.push(item);
      else if (!current && item) current = { title: "Roadmap", items: [item] };
    } else if (current) {
      current.items.push(trimmed);
    } else {
      current = { title: "Overview", items: [trimmed] };
    }
  });
  if (current) sections.push(current);
  return sections.filter((s) => s.items.length > 0);
}

const stageColors = [
  "bg-brand-600", "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-amber-500", "bg-rose-600", "bg-cyan-600",
];

interface ProfileForm {
  currentRole: string;
  experience: string;
  education: string;
  skills: string;
  interestedDomains: string;
  careerGoal: string;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const toast = useToast();
  const [roadmap, setRoadmap]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    currentRole: "", experience: "", education: "",
    skills: "", interestedDomains: "", careerGoal: "",
  });

  // Load profile on mount — pre-fill the form
  useEffect(() => {
    api.get("/profile")
      .then((r) => {
        const p = r.data;
        setForm({
          currentRole:       p.currentRole       ?? "",
          experience:        String(p.experience ?? ""),
          education:         p.education         ?? "",
          skills:            (p.skills ?? []).join(", "),
          interestedDomains: (p.interestedDomains ?? []).join(", "),
          careerGoal:        p.careerGoal        ?? "",
        });
      })
      .catch(console.error)
      .finally(() => setProfileLoading(false));
  }, []);

  const set = (k: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const hasMinProfile =
    form.currentRole.trim() || form.careerGoal.trim() || form.skills.trim();

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const response = await api.post("/ai/roadmap", {
        currentRole:       form.currentRole,
        experience:        Number(form.experience) || 0,
        education:         form.education,
        skills:            form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        interestedDomains: form.interestedDomains.split(",").map((s) => s.trim()).filter(Boolean),
        careerGoal:        form.careerGoal,
      });
      setRoadmap(response.data.roadmap);
      setEditingProfile(false);
      toast.success("Roadmap generated!", "Your career roadmap is ready.");
    } catch {
      toast.error("Generation failed", "Could not generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sections = parseRoadmapText(roadmap);

  if (profileLoading) return <PageLoader message="Loading your profile…" />;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Map size={22} className="text-brand-600" />
            Career Roadmap
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            A personalised learning path based on your background and career goals
          </p>
        </div>
        <Link href="/roadmap/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      {/* Profile form — always shown before first generation; collapsible after */}
      {(!roadmap || editingProfile) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={15} className="text-brand-600" />
              Your Profile Information
            </CardTitle>
            <p className="text-sm text-text-secondary mt-0.5">
              Review or update the details below — the roadmap will be generated from these inputs.
            </p>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Current role / title" placeholder="e.g. Frontend Developer"
              value={form.currentRole} onChange={set("currentRole")} />
            <Input label="Experience (years)" type="number" min="0" placeholder="e.g. 2"
              value={form.experience} onChange={set("experience")} />
            <Input label="Education" placeholder="e.g. B.Tech Computer Science"
              value={form.education} onChange={set("education")} />
            <Input label="Career goal / target role" placeholder="e.g. Full Stack Developer"
              value={form.careerGoal} onChange={set("careerGoal")} />
            <div className="sm:col-span-2">
              <Input label="Current skills (comma-separated)" placeholder="e.g. HTML, CSS, JavaScript, React"
                value={form.skills} onChange={set("skills")} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Interested domains (comma-separated)" placeholder="e.g. Web Development, Cloud, Data Science"
                value={form.interestedDomains} onChange={set("interestedDomains")} />
            </div>
          </div>

          {!hasMinProfile && (
            <p className="text-xs text-warning mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
              Fill in at least your current role, skills, or career goal for a useful roadmap.
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <Button onClick={generateRoadmap} loading={loading} leftIcon={<Sparkles size={14} />}>
              {loading ? "Generating…" : "Generate Roadmap"}
            </Button>
            {roadmap && (
              <Button variant="ghost" size="sm" onClick={() => setEditingProfile(false)}>Cancel</Button>
            )}
          </div>
        </Card>
      )}

      {/* After roadmap generated — compact profile summary + edit button */}
      {roadmap && !editingProfile && (
        <Card padding="sm" className="bg-surface-3 border-border">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
              {form.currentRole && (
                <span className="flex items-center gap-1">
                  <Briefcase size={11} className="text-text-muted" />
                  {form.currentRole}
                </span>
              )}
              {form.careerGoal && (
                <span className="flex items-center gap-1">
                  <Map size={11} className="text-text-muted" />
                  Goal: {form.careerGoal}
                </span>
              )}
              {form.experience && (
                <span>{form.experience} yr{form.experience !== "1" ? "s" : ""} exp</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" leftIcon={<Edit3 size={13} />}
                onClick={() => setEditingProfile(true)}>
                Edit Profile
              </Button>
              <Button size="sm" variant="outline" leftIcon={<Sparkles size={13} />}
                onClick={generateRoadmap} loading={loading}>
                Regenerate
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card className="py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
            <p className="text-sm text-text-secondary">Building your personalised roadmap…</p>
          </div>
        </Card>
      )}

      {/* Roadmap output */}
      {roadmap && !loading && sections.length > 0 && (
        <div className="space-y-4">
          <Badge variant="success">Roadmap Generated</Badge>
          <div className="relative">
            <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-border hidden md:block" />
            <div className="space-y-4">
              {sections.map((section, i) => (
                <div key={i} className="flex gap-4">
                  <div className="hidden md:flex flex-col items-center shrink-0">
                    <div className={`w-10 h-10 rounded-xl ${stageColors[i % stageColors.length]} text-white text-sm font-bold flex items-center justify-center shadow-sm z-10`}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`md:hidden w-8 h-8 rounded-lg ${stageColors[i % stageColors.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary mb-3">{section.title}</h3>
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

      {roadmap && !loading && sections.length === 0 && (
        <Card>
          <CardHeader><CardTitle>Your Roadmap</CardTitle></CardHeader>
          <pre className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed font-sans">{roadmap}</pre>
        </Card>
      )}
    </div>
  );
}

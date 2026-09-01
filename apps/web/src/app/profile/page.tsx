"use client";

import { useEffect, useState } from "react";
import { User, Mail, Briefcase, BookOpen, Target, Plus, X, Save } from "lucide-react";
import api from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface Profile {
  name: string;
  email: string;
  currentRole: string;
  experience: number;
  skills: string[];
  interestedDomains: string[];
  careerGoal: string;
  education: string;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data)).catch(console.error);
  }, []);

  const updateProfile = async () => {
    setSaving(true);
    try {
      await api.put("/profile", profile);
      toast.success("Profile updated", "Your changes have been saved.");
    } catch {
      toast.error("Save failed", "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!profile || !skillInput.trim()) return;
    setProfile({ ...profile, skills: [...profile.skills, skillInput.trim()] });
    setSkillInput("");
  };

  const removeSkill = (i: number) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter((_, idx) => idx !== i) });
  };

  const addDomain = () => {
    if (!profile || !domainInput.trim()) return;
    setProfile({ ...profile, interestedDomains: [...profile.interestedDomains, domainInput.trim()] });
    setDomainInput("");
  };

  const removeDomain = (i: number) => {
    if (!profile) return;
    setProfile({ ...profile, interestedDomains: profile.interestedDomains.filter((_, idx) => idx !== i) });
  };

  if (!profile) return <PageLoader message="Loading profile…" />;

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary text-sm mt-1">
            Keep your profile up to date for better AI recommendations
          </p>
        </div>
        <Button onClick={updateProfile} loading={saving} leftIcon={<Save size={15} />}>
          Save Changes
        </Button>
      </div>

      {/* Avatar + basic info */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-brand-200 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary">{profile.name}</h2>
            <p className="text-sm text-text-secondary">{profile.email}</p>
            <Badge variant="brand" className="mt-1">
              {profile.currentRole || user?.role || "Student"}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={16} className="text-brand-600" />
            <CardTitle>Personal Information</CardTitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Full Name</label>
            <div className="px-3 py-2.5 rounded-lg border border-border bg-surface-3 text-sm text-text-secondary">
              {profile.name}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Email</label>
            <div className="px-3 py-2.5 rounded-lg border border-border bg-surface-3 text-sm text-text-secondary">
              {profile.email}
            </div>
          </div>
          <Input
            label="Current Role"
            value={profile.currentRole}
            onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
            placeholder="e.g. Software Engineer"
            leftIcon={<Briefcase size={14} />}
          />
          <Input
            label="Education"
            value={profile.education}
            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            placeholder="e.g. B.Tech Computer Science"
            leftIcon={<BookOpen size={14} />}
          />
          <Input
            label="Years of Experience"
            type="number"
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: Number(e.target.value) })}
            placeholder="0"
          />
          <Input
            label="Career Goal"
            value={profile.careerGoal}
            onChange={(e) => setProfile({ ...profile, careerGoal: e.target.value })}
            placeholder="e.g. Full Stack Developer"
            leftIcon={<Target size={14} />}
          />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            AI uses your skills for personalized recommendations
          </p>
        </CardHeader>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill (e.g. React, Python)"
            className="flex-1 rounded-lg border border-border bg-surface text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-text-muted"
          />
          <Button onClick={addSkill} variant="outline" size="md" leftIcon={<Plus size={14} />}>
            Add
          </Button>
        </div>
        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {skill}
                <button onClick={() => removeSkill(i)} className="hover:text-brand-900 transition-colors" aria-label="Remove skill">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-4">No skills added yet</p>
        )}
      </Card>

      {/* Interested domains */}
      <Card>
        <CardHeader>
          <CardTitle>Interested Domains</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">
            Helps tailor your learning path and resource recommendations
          </p>
        </CardHeader>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
            placeholder="Add a domain (e.g. Web Dev, AI/ML)"
            className="flex-1 rounded-lg border border-border bg-surface text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-text-muted"
          />
          <Button onClick={addDomain} variant="outline" size="md" leftIcon={<Plus size={14} />}>
            Add
          </Button>
        </div>
        {profile.interestedDomains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.interestedDomains.map((domain, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {domain}
                <button onClick={() => removeDomain(i)} className="hover:text-emerald-900 transition-colors" aria-label="Remove domain">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted text-center py-4">No domains added yet</p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={updateProfile} loading={saving} leftIcon={<Save size={15} />} size="lg">
          Save All Changes
        </Button>
      </div>
    </div>
  );
}

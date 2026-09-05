"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, ChevronDown, ChevronUp, BookOpen, Zap } from "lucide-react";
import api from "@/src/services/api";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Mentor {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  students: Student[];
}

export default function OrganizationMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.get("/organization/mentors")
      .then((r) => setMentors(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading mentors…" />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users size={22} className="text-indigo-600" />
            All Mentors
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} in your organization
          </p>
        </div>
        <Link href="/organization/mentors/create">
          <Button leftIcon={<Plus size={14} />} size="sm">Add Mentor</Button>
        </Link>
      </div>

      {mentors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No mentors yet"
          description="Add mentors to your organization so they can be assigned to students."
          action={{ label: "Add Mentor", onClick: () => { window.location.href = "/organization/mentors/create"; } }}
        />
      ) : (
        <div className="space-y-3">
          {mentors.map((mentor) => {
            const isOpen = expanded === mentor._id;
            const initials = mentor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <Card key={mentor._id}>
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : mentor._id)}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary text-sm">{mentor.name}</p>
                    <p className="text-xs text-text-muted">{mentor.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={mentor.students.length > 0 ? "brand" : "default"} size="sm">
                      {mentor.students.length} student{mentor.students.length !== 1 ? "s" : ""}
                    </Badge>
                    {isOpen
                      ? <ChevronUp size={16} className="text-text-muted" />
                      : <ChevronDown size={16} className="text-text-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {mentor.students.length === 0 ? (
                      <p className="text-sm text-text-muted text-center py-2">No students assigned to this mentor.</p>
                    ) : (
                      <div className="space-y-2">
                        {mentor.students.map((s) => (
                          <div key={s._id} className="flex items-center gap-3 py-1.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold shrink-0">
                              {s.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                              <p className="text-xs text-text-muted truncate">{s.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Link href="/organization/assignments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                        Manage assignments →
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

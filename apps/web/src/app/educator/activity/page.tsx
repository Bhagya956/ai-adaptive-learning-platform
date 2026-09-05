"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, BookOpen, FileText, Target, Map, Brain,
  Zap, Mic2, Layers, Clock, GitBranch, Users,
} from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

const activityIconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  roadmap:        { icon: Map,       color: "text-indigo-600", bg: "bg-indigo-50"  },
  resume:         { icon: FileText,  color: "text-blue-600",   bg: "bg-blue-50"    },
  skill_gap:      { icon: Target,    color: "text-rose-600",   bg: "bg-rose-50"    },
  interview_prep: { icon: Mic2,      color: "text-green-600",  bg: "bg-green-50"   },
  mock_interview: { icon: Mic2,      color: "text-teal-600",   bg: "bg-teal-50"    },
  quiz:           { icon: Zap,       color: "text-amber-600",  bg: "bg-amber-50"   },
  learning:       { icon: BookOpen,  color: "text-brand-600",  bg: "bg-brand-50"   },
  portfolio:      { icon: GitBranch, color: "text-slate-700",  bg: "bg-slate-100"  },
  resource:       { icon: Layers,    color: "text-cyan-600",   bg: "bg-cyan-50"    },
};

function getActivityMeta(type: string) {
  const key = Object.keys(activityIconMap).find((k) => type?.toLowerCase().includes(k));
  return key ? activityIconMap[key] : { icon: Activity, color: "text-text-muted", bg: "bg-surface-3" };
}

interface ActivityItem {
  _id: string;
  activityType: string;
  description: string;
  createdAt: string;
  userId: { _id: string; name: string; email: string } | null;
}

function groupByDate(activities: ActivityItem[]) {
  const groups: Record<string, ActivityItem[]> = {};
  activities.forEach((a) => {
    const date = new Date(a.createdAt).toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(a);
  });
  return groups;
}

export default function EducatorActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/educator/activity")
      .then((r) => setActivities(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader message="Loading learner activity…" />;

  const groups = groupByDate(activities);
  const dates = Object.keys(groups);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Activity size={22} className="text-brand-600" />
          Learner Activity Timeline
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Chronological activity log of your assigned learners
        </p>
      </div>

      {dates.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No learner activity yet"
          description="Activity from your assigned learners will appear here as they use the platform."
        />
      ) : (
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wide">
                  <Clock size={12} />
                  {date}
                </div>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="default" size="sm">{groups[date].length}</Badge>
              </div>

              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-3">
                  {groups[date].map((activity) => {
                    const meta = getActivityMeta(activity.activityType);
                    const Icon = meta.icon;
                    return (
                      <div key={activity._id} className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 z-10 border-2 border-surface`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 pb-1">
                          <Card padding="sm" className="hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {activity.userId && (
                                    <Link
                                      href={`/educator/learners/${activity.userId._id}`}
                                      className="text-xs font-semibold text-brand-600 hover:underline shrink-0"
                                    >
                                      {activity.userId.name}
                                    </Link>
                                  )}
                                  <span className="text-sm font-medium text-text-primary capitalize">
                                    {activity.activityType?.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                                  {activity.description}
                                </p>
                              </div>
                              <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0">
                                {new Date(activity.createdAt).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

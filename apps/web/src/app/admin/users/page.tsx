"use client";

import { useEffect, useState } from "react";
import {
  Users, Search, Trash2, Eye, X, User, Mail, Briefcase,
  GraduationCap, Star, Building2, UserCheck, UserX,
  ChevronDown, ChevronUp, BookOpen,
} from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import StatCard from "@/src/components/ui/StatCard";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import EmptyState from "@/src/components/ui/EmptyState";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentRow {
  _id: string; name: string; email: string;
  education: string; skills: string[]; careerGoal: string; createdAt: string;
  mentorName: string | null; organizationName: string | null;
  hasEducator: boolean; hasOrganization: boolean;
}

interface EducatorRow {
  _id: string; name: string; email: string; createdAt: string;
  organizationName: string | null; hasOrganization: boolean;
  assignedStudents: number;
}

interface OrgStudent { _id: string; name: string; email: string; mentorName: string | null; hasEducator: boolean; }
interface OrgMentor  { _id: string; name: string; email: string; assignedStudents: number; }

interface OrganizationRow {
  _id: string; name: string; email: string; createdAt: string;
  totalMentors: number; totalStudents: number;
  assignedStudents: number; unassignedStudents: number;
  mentors: OrgMentor[]; students: OrgStudent[];
}

interface Summary {
  totalStudents: number; independentStudents: number;
  educatorAssociatedStudents: number; organizationStudents: number;
  totalEducators: number; independentEducators: number;
  organizationEducators: number; totalOrganizations: number;
}

type MainTab = "students" | "educators" | "organizations";
type StudentFilter = "all" | "independent" | "educator" | "organization";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Initials({ name, bg = "from-brand-400 to-brand-600" }: { name: string; bg?: string }) {
  return (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
      {name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
    </div>
  );
}

function roleBadge(row: StudentRow) {
  if (row.hasOrganization) return <Badge variant="info" size="sm">Organization</Badge>;
  if (row.hasEducator)     return <Badge variant="success" size="sm">Educator-Linked</Badge>;
  return                          <Badge variant="default" size="sm">Independent</Badge>;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const toast = useToast();

  // Remote data
  const [structured, setStructured] = useState<{
    students: StudentRow[]; educators: EducatorRow[];
    organizations: OrganizationRow[]; summary: Summary;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Detail panel (original endpoint)
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Navigation
  const [tab, setTab] = useState<MainTab>("students");
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/admin/users/structured")
      .then((r) => setStructured(r.data))
      .catch(() => toast.error("Load failed", "Could not load structured users."))
      .finally(() => setLoading(false));
  }, []);

  const viewUser = async (userId: string) => {
    setDetailLoading(true);
    try {
      const r = await api.get(`/admin/users/${userId}`);
      setSelectedUser(r.data);
    } catch {
      toast.error("Load failed", "Could not load user details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted", "The user has been removed.");
      if (selectedUser?._id === userId) setSelectedUser(null);
      // Refetch
      const r = await api.get("/admin/users/structured");
      setStructured(r.data);
    } catch {
      toast.error("Delete failed", "Could not delete this user.");
    }
  };

  if (loading) return <PageLoader message="Loading user management…" />;
  if (!structured) return <EmptyState icon={Users} title="Failed to load" description="Refresh the page." />;

  const { students, educators, organizations, summary } = structured;

  // ── Filter students ──────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.mentorName?.toLowerCase().includes(q) ?? false) ||
      (s.organizationName?.toLowerCase().includes(q) ?? false);
    const matchesFilter =
      studentFilter === "all" ? true :
      studentFilter === "independent" ? (!s.hasEducator && !s.hasOrganization) :
      studentFilter === "educator"    ? (s.hasEducator && !s.hasOrganization) :
      studentFilter === "organization" ? s.hasOrganization : true;
    return matchesSearch && matchesFilter;
  });

  // ── Filter educators ─────────────────────────────────────────────────────
  const filteredEducators = educators.filter((e) => {
    const q = search.toLowerCase();
    return !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.organizationName?.toLowerCase().includes(q) ?? false);
  });

  // ── Filter organizations ─────────────────────────────────────────────────
  const filteredOrgs = organizations.filter((o) => {
    const q = search.toLowerCase();
    return !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users size={22} className="text-brand-600" />
          User Management
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Structured view of all platform users and their relationships
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Students"     value={summary.totalStudents}     icon={GraduationCap} iconColor="text-blue-600"   iconBg="bg-blue-50" />
        <StatCard title="Total Educators"    value={summary.totalEducators}    icon={Users}         iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="Total Organizations" value={summary.totalOrganizations} icon={Building2}   iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatCard title="Independent Students" value={summary.independentStudents} icon={User}      iconColor="text-text-secondary" iconBg="bg-surface-3" />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-surface-3 rounded-lg p-1">
          {(["students", "educators", "organizations"] as MainTab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setSearch(""); setStudentFilter("all"); setSelectedUser(null); }}
              className={["px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                tab === t ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"].join(" ")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <Input placeholder="Search…" value={search} onChange={(e) => { setSearch(e.target.value); }}
            leftIcon={<Search size={14} />} />
        </div>
        {tab === "students" && (
          <div className="flex gap-1 bg-surface-3 rounded-lg p-1 text-xs">
            {(["all", "independent", "educator", "organization"] as StudentFilter[]).map((f) => {
              const labels: Record<StudentFilter, string> = {
                all: "All", independent: "Independent", educator: "Educator-Linked", organization: "Org"
              };
              return (
                <button key={f} onClick={() => setStudentFilter(f)}
                  className={["px-2.5 py-1 rounded-md font-medium transition-colors",
                    studentFilter === f ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary"].join(" ")}>
                  {labels[f]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main content + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedUser ? "lg:col-span-2" : "lg:col-span-3"}>

          {/* ── STUDENTS TAB ── */}
          {tab === "students" && (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-3">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Student</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Mentor / Org</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Career Goal</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={5} className="py-12">
                        <EmptyState icon={Users} title="No students found" description="Try changing the filter or search term." />
                      </td></tr>
                    ) : filteredStudents.map((s) => (
                      <tr key={s._id}
                        className={["border-b border-border last:border-0 hover:bg-surface-2 transition-colors",
                          selectedUser?._id === s._id ? "bg-brand-50" : ""].join(" ")}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Initials name={s.name} />
                            <div>
                              <p className="font-medium text-text-primary">{s.name}</p>
                              <p className="text-xs text-text-muted">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">{roleBadge(s)}</td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="space-y-0.5">
                            {s.organizationName && (
                              <p className="text-xs text-text-secondary flex items-center gap-1">
                                <Building2 size={11} className="text-violet-500" /> {s.organizationName}
                              </p>
                            )}
                            {s.mentorName && (
                              <p className="text-xs text-text-secondary flex items-center gap-1">
                                <UserCheck size={11} className="text-indigo-500" /> {s.mentorName}
                              </p>
                            )}
                            {s.hasOrganization && !s.mentorName && (
                              <p className="text-xs text-warning flex items-center gap-1">
                                <UserX size={11} /> Unassigned
                              </p>
                            )}
                            {!s.hasEducator && !s.hasOrganization && (
                              <p className="text-xs text-text-muted">—</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-text-muted truncate max-w-[140px]">
                          {s.careerGoal || "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => viewUser(s._id)} leftIcon={<Eye size={13} />}>View</Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteUser(s._id)}
                              className="text-danger hover:bg-danger-bg" leftIcon={<Trash2 size={13} />}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t border-border bg-surface-3 text-xs text-text-muted">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
                {studentFilter !== "all" && ` · filtered by "${studentFilter}"`}
              </div>
            </Card>
          )}

          {/* ── EDUCATORS TAB ── */}
          {tab === "educators" && (
            <Card padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-3">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Mentor</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Organization</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Learners</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEducators.length === 0 ? (
                      <tr><td colSpan={5} className="py-12">
                        <EmptyState icon={Users} title="No educators found" description="Try adjusting your search." />
                      </td></tr>
                    ) : filteredEducators.map((e) => (
                      <tr key={e._id}
                        className={["border-b border-border last:border-0 hover:bg-surface-2 transition-colors",
                          selectedUser?._id === e._id ? "bg-brand-50" : ""].join(" ")}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Initials name={e.name} bg="from-indigo-400 to-indigo-600" />
                            <div>
                              <p className="font-medium text-text-primary">{e.name}</p>
                              <p className="text-xs text-text-muted">{e.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {e.hasOrganization
                            ? <Badge variant="info" size="sm">Organization</Badge>
                            : <Badge variant="default" size="sm">Independent</Badge>}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-xs text-text-secondary">
                          {e.organizationName
                            ? <span className="flex items-center gap-1"><Building2 size={11} className="text-violet-500" /> {e.organizationName}</span>
                            : <span className="text-text-muted">—</span>}
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-right">
                          <Badge variant={e.assignedStudents > 0 ? "brand" : "default"} size="sm">
                            {e.assignedStudents} learner{e.assignedStudents !== 1 ? "s" : ""}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => viewUser(e._id)} leftIcon={<Eye size={13} />}>View</Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteUser(e._id)}
                              className="text-danger hover:bg-danger-bg" leftIcon={<Trash2 size={13} />}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t border-border bg-surface-3 text-xs text-text-muted">
                {filteredEducators.length} educator{filteredEducators.length !== 1 ? "s" : ""} ·{" "}
                {summary.independentEducators} independent · {summary.organizationEducators} org-linked
              </div>
            </Card>
          )}

          {/* ── ORGANIZATIONS TAB ── */}
          {tab === "organizations" && (
            <div className="space-y-3">
              {filteredOrgs.length === 0 ? (
                <Card><EmptyState icon={Building2} title="No organizations found" description="Try adjusting your search." /></Card>
              ) : filteredOrgs.map((o) => {
                const isExpanded = expandedOrg === o._id;
                return (
                  <Card key={o._id}>
                    {/* Org header row */}
                    <div className="flex items-center gap-4 cursor-pointer"
                      onClick={() => setExpandedOrg(isExpanded ? null : o._id)}>
                      <Initials name={o.name} bg="from-violet-400 to-violet-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary">{o.name}</p>
                        <p className="text-xs text-text-muted">{o.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <Badge variant="info" size="sm">{o.totalMentors} mentor{o.totalMentors !== 1 ? "s" : ""}</Badge>
                        <Badge variant="brand" size="sm">{o.totalStudents} student{o.totalStudents !== 1 ? "s" : ""}</Badge>
                        <Badge variant="success" size="sm">{o.assignedStudents} assigned</Badge>
                        {o.unassignedStudents > 0 &&
                          <Badge variant="warning" size="sm">{o.unassignedStudents} unassigned</Badge>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); viewUser(o._id); }}
                          leftIcon={<Eye size={13} />}>View</Button>
                        {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                      </div>
                    </div>

                    {/* Expandable relationship view */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mentors */}
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Users size={11} /> Mentors
                          </p>
                          {o.mentors.length === 0 ? (
                            <p className="text-xs text-text-muted">No mentors yet.</p>
                          ) : o.mentors.map((m) => (
                            <div key={m._id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[9px] font-bold shrink-0">
                                {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm text-text-primary flex-1 truncate">{m.name}</span>
                              <Badge variant={m.assignedStudents > 0 ? "brand" : "default"} size="sm">
                                {m.assignedStudents} student{m.assignedStudents !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {/* Students */}
                        <div>
                          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
                            <GraduationCap size={11} /> Students
                          </p>
                          {o.students.length === 0 ? (
                            <p className="text-xs text-text-muted">No students yet.</p>
                          ) : o.students.map((s) => (
                            <div key={s._id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[9px] font-bold shrink-0">
                                {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm text-text-primary flex-1 truncate">{s.name}</span>
                              {s.mentorName
                                ? <span className="text-xs text-success flex items-center gap-1 shrink-0"><UserCheck size={10} /> {s.mentorName}</span>
                                : <span className="text-xs text-warning flex items-center gap-1 shrink-0"><UserX size={10} /> Unassigned</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
              <div className="text-xs text-text-muted px-1">{filteredOrgs.length} organization{filteredOrgs.length !== 1 ? "s" : ""}</div>
            </div>
          )}
        </div>

        {/* ── Detail panel (unchanged from original) ── */}
        {selectedUser && (
          <div>
            <Card>
              <div className="flex items-start justify-between mb-4">
                <CardTitle>User Details</CardTitle>
                <button onClick={() => setSelectedUser(null)}
                  className="text-text-muted hover:text-text-primary transition-colors" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center mb-5 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xl font-bold text-white mb-3">
                  {selectedUser.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-text-primary">{selectedUser.name}</h3>
                <p className="text-xs text-text-secondary">{selectedUser.email}</p>
                <Badge variant={selectedUser.role === "admin" ? "danger" : "brand"} className="mt-2 capitalize">
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { icon: Briefcase,     label: "Current Role", value: selectedUser.currentRole || "—" },
                  { icon: Star,          label: "Experience",   value: selectedUser.experience ? `${selectedUser.experience} years` : "—" },
                  { icon: GraduationCap, label: "Education",    value: selectedUser.education  || "—" },
                  { icon: User,          label: "Career Goal",  value: selectedUser.careerGoal || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    <Icon size={14} className="text-text-muted mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="text-text-primary truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser.skills?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-text-muted mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.skills.slice(0, 8).map((s: string, i: number) => (
                      <Badge key={i} variant="brand" size="sm">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="danger" size="sm" className="w-full"
                  onClick={() => deleteUser(selectedUser._id)} leftIcon={<Trash2 size={13} />}>
                  Delete User
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

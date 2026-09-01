"use client";

import { useEffect, useState } from "react";
import { Users, Search, Trash2, Eye, X, User, Mail, Briefcase, GraduationCap, Star } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";
import EmptyState from "@/src/components/ui/EmptyState";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch {
      toast.error("Load failed", "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  const viewUser = async (userId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch {
      toast.error("Load failed", "Could not load user details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted", "The user has been removed.");
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      if (selectedUser?._id === userId) setSelectedUser(null);
    } catch {
      toast.error("Delete failed", "Could not delete this user.");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader message="Loading users…" />;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users size={22} className="text-brand-600" />
          User Management
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          View, search, and manage all registered users on the platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <Badge variant="default">{filtered.length} users</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User table */}
        <div className={selectedUser ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-3">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Joined</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12">
                        <EmptyState icon={Users} title="No users found" description="Try adjusting your search." />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr
                        key={user._id}
                        className={[
                          "border-b border-border last:border-0 hover:bg-surface-2 transition-colors",
                          selectedUser?._id === user._id ? "bg-brand-50" : "",
                        ].join(" ")}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                              {user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">{user.name}</p>
                              <p className="text-xs text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={user.role === "admin" ? "danger" : "brand"}
                            size="sm"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell text-text-muted text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewUser(user._id)}
                              leftIcon={<Eye size={13} />}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUser(user._id)}
                              className="text-danger hover:bg-danger-bg"
                              leftIcon={<Trash2 size={13} />}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div>
            <Card>
              <div className="flex items-start justify-between mb-4">
                <CardTitle>User Details</CardTitle>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Close detail"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center mb-5 pt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-xl font-bold text-white mb-3">
                  {selectedUser.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-text-primary">{selectedUser.name}</h3>
                <p className="text-xs text-text-secondary">{selectedUser.email}</p>
                <Badge variant={selectedUser.role === "admin" ? "danger" : "brand"} className="mt-2">
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { icon: Briefcase, label: "Current Role", value: selectedUser.currentRole || "—" },
                  { icon: Star, label: "Experience", value: selectedUser.experience ? `${selectedUser.experience} years` : "—" },
                  { icon: GraduationCap, label: "Education", value: selectedUser.education || "—" },
                  { icon: User, label: "Career Goal", value: selectedUser.careerGoal || "—" },
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
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => deleteUser(selectedUser._id)}
                  leftIcon={<Trash2 size={13} />}
                >
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

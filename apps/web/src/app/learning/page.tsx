"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Plus, Trash2, CheckCircle2, Clock,
  PlayCircle, AlertTriangle, X, Calendar,
} from "lucide-react";
import {
  createTask, getTasks, updateTaskStatus, deleteTask,
} from "@/src/lib/learning";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Input";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import EmptyState from "@/src/components/ui/EmptyState";
import { PageLoader } from "@/src/components/ui/LoadingSpinner";

// ─── Types ────────────────────────────────────────────────────────────────────
type StoredStatus = "open" | "pending" | "wip" | "completed";
type DisplayStatus = "open" | "wip" | "backlog" | "completed";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: StoredStatus;
  dueDate?: string | null;
  dueTime?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute the effective display status (may return "backlog" for overdue non-completed tasks). */
function getDisplayStatus(task: Task): DisplayStatus {
  if (task.status === "completed") return "completed";

  if (task.dueDate) {
    const due = buildDueDate(task.dueDate, task.dueTime);
    if (due && new Date() > due) return "backlog";
  }

  // "pending" is the legacy alias for "open"
  if (task.status === "wip") return "wip";
  return "open";
}

/** Build a JS Date from stored dueDate + optional dueTime. */
function buildDueDate(dueDate: string, dueTime?: string | null): Date | null {
  if (!dueDate) return null;
  const timeStr = dueTime ?? "23:59";
  const d = new Date(`${dueDate}T${timeStr}:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** Human-readable due/overdue string. */
function dueDateLabel(task: Task): string | null {
  if (!task.dueDate) return null;
  const due = buildDueDate(task.dueDate, task.dueTime);
  if (!due) return null;

  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  const fmtDate = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtTime = task.dueTime
    ? new Date(`1970-01-01T${task.dueTime}:00`).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit",
      })
    : "";
  const fmtFull = fmtTime ? `${fmtDate}, ${fmtTime}` : fmtDate;

  if (task.status === "completed") return `Due ${fmtFull}`;
  if (diffMins < 0) {
    const overMins = Math.abs(diffMins);
    if (overMins < 60) return `Overdue by ${overMins}m`;
    const overHrs = Math.round(overMins / 60);
    if (overHrs < 48) return `Overdue by ${overHrs}h`;
    return `Overdue by ${Math.round(overHrs / 24)}d`;
  }
  if (diffMins < 60) return `${diffMins}m remaining`;
  const hrs = Math.round(diffMins / 60);
  if (hrs < 48) return `${hrs}h remaining`;
  return `${Math.round(hrs / 24)}d remaining`;
}

/** Did the task complete after its deadline? */
function completedLate(task: Task): boolean {
  if (task.status !== "completed" || !task.dueDate || !task.completedAt) return false;
  const due = buildDueDate(task.dueDate, task.dueTime);
  if (!due) return false;
  return new Date(task.completedAt) > due;
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ─── Status config ────────────────────────────────────────────────────────────
const TAB_CONFIG: { id: DisplayStatus; label: string; color: string; emptyTitle: string }[] = [
  { id: "open",      label: "Open",      color: "text-brand-600",   emptyTitle: "No open tasks" },
  { id: "wip",       label: "In Progress", color: "text-amber-600", emptyTitle: "Nothing in progress" },
  { id: "backlog",   label: "Backlog",   color: "text-rose-600",    emptyTitle: "No overdue tasks" },
  { id: "completed", label: "Completed", color: "text-success",     emptyTitle: "No completed tasks yet" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function LearningPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DisplayStatus>("open");
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create form
  const [newTitle, setNewTitle]       = useState("");
  const [newDesc, setNewDesc]         = useState("");
  const [newDueDate, setNewDueDate]   = useState("");
  const [newDueTime, setNewDueTime]   = useState("");

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      toast.error("Load failed", "Could not load your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  // Group tasks by display status
  const grouped: Record<DisplayStatus, Task[]> = { open: [], wip: [], backlog: [], completed: [] };
  for (const t of tasks) grouped[getDisplayStatus(t)].push(t);

  const handleCreate = async () => {
    if (!newTitle.trim()) { toast.warning("Title required", "Give your task a name."); return; }
    setSubmitting(true);
    try {
      await createTask(newTitle.trim(), newDesc.trim(), newDueDate || null, newDueTime || null);
      setNewTitle(""); setNewDesc(""); setNewDueDate(""); setNewDueTime("");
      setShowCreate(false);
      toast.success("Task created", "Your task is now open.");
      loadTasks();
    } catch {
      toast.error("Create failed", "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (id: string, status: StoredStatus) => {
    try {
      await updateTaskStatus(id, status);
      loadTasks();
    } catch {
      toast.error("Update failed", "Could not update task status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      toast.success("Deleted", "Task removed.");
      loadTasks();
    } catch {
      toast.error("Delete failed", "Could not delete task.");
    }
  };

  if (loading) return <PageLoader message="Loading your tasks…" />;

  const visibleTasks = grouped[activeTab];
  const tabCounts: Record<DisplayStatus, number> = {
    open: grouped.open.length,
    wip: grouped.wip.length,
    backlog: grouped.backlog.length,
    completed: grouped.completed.length,
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen size={22} className="text-brand-600" />
            My Learning
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your learning tasks and track progress
          </p>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setShowCreate((v) => !v)}>
          Add Task
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border border-brand-200 bg-brand-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary text-sm">New Task</h3>
            <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-3">
            <Input
              label="Task title"
              placeholder="e.g. Learn Python basics"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Textarea
              label="Description (optional)"
              placeholder="What do you want to accomplish?"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Due date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface text-text-primary text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Due time</label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface text-text-primary text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleCreate} loading={submitting} size="sm">Create Task</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-3 rounded-lg p-1 w-fit">
        {TAB_CONFIG.map(({ id, label, color }) => (
          <button key={id}
            onClick={() => setActiveTab(id)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary",
            ].join(" ")}
          >
            {label}
            {tabCounts[id] > 0 && (
              <span className={[
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                activeTab === id
                  ? id === "backlog" ? "bg-rose-100 text-rose-700"
                    : id === "wip" ? "bg-amber-100 text-amber-700"
                    : "bg-brand-100 text-brand-700"
                  : "bg-surface-3 text-text-muted",
              ].join(" ")}>
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {visibleTasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={activeTab === "completed" ? CheckCircle2 : activeTab === "backlog" ? AlertTriangle : BookOpen}
            title={TAB_CONFIG.find((t) => t.id === activeTab)?.emptyTitle ?? "No tasks"}
            description={
              activeTab === "open" ? "Click 'Add Task' to create your first learning task." :
              activeTab === "wip"  ? "Start an open task to move it here." :
              activeTab === "backlog" ? "Tasks past their deadline will appear here." :
              "Complete some tasks to see them here."
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => {
            const display = getDisplayStatus(task);
            const dueLabel = dueDateLabel(task);
            const late = completedLate(task);
            const overdue = display === "backlog";

            return (
              <Card
                key={task._id}
                className={overdue ? "border-l-4 border-l-rose-400" : display === "wip" ? "border-l-4 border-l-amber-400" : ""}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon / action button */}
                  <div className="shrink-0 pt-0.5">
                    {display === "completed" ? (
                      <button onClick={() => handleStatus(task._id, "open")}
                        title="Mark as open"
                        className="w-6 h-6 rounded-full bg-success flex items-center justify-center hover:opacity-80 transition-opacity">
                        <CheckCircle2 size={14} className="text-white" />
                      </button>
                    ) : display === "wip" ? (
                      <button onClick={() => handleStatus(task._id, "completed")}
                        title="Mark complete"
                        className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center hover:bg-amber-50 transition-colors">
                        <PlayCircle size={12} className="text-amber-500" />
                      </button>
                    ) : overdue ? (
                      <button onClick={() => handleStatus(task._id, "completed")}
                        title="Mark complete"
                        className="w-6 h-6 rounded-full border-2 border-rose-400 flex items-center justify-center hover:bg-rose-50 transition-colors">
                        <AlertTriangle size={12} className="text-rose-500" />
                      </button>
                    ) : (
                      <button onClick={() => handleStatus(task._id, "wip")}
                        title="Start task"
                        className="w-6 h-6 rounded-full border-2 border-border hover:border-brand-500 hover:bg-brand-50 flex items-center justify-center transition-colors">
                        <div className="w-2 h-2 rounded-full bg-border" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={[
                          "text-sm font-medium leading-snug",
                          display === "completed" ? "line-through text-text-muted" : "text-text-primary",
                        ].join(" ")}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{task.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Status badge */}
                        {display === "wip" && <Badge variant="warning" size="sm">In Progress</Badge>}
                        {display === "backlog" && <Badge variant="danger" size="sm">Backlog</Badge>}
                        {display === "completed" && (
                          <Badge variant="success" size="sm">
                            {late ? "Completed late" : "Completed"}
                          </Badge>
                        )}

                        {/* Actions */}
                        {display === "open" && (
                          <Button size="sm" variant="ghost"
                            className="text-xs px-2 py-1 text-brand-600 hover:bg-brand-50"
                            onClick={() => handleStatus(task._id, "wip")}>
                            Start
                          </Button>
                        )}
                        {(display === "wip" || display === "backlog") && (
                          <Button size="sm" variant="ghost"
                            className="text-xs px-2 py-1 text-success hover:bg-success-bg"
                            onClick={() => handleStatus(task._id, "completed")}>
                            Complete
                          </Button>
                        )}
                        <button onClick={() => handleDelete(task._id)}
                          className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-bg transition-colors"
                          title="Delete task">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                      {dueLabel && (
                        <span className={[
                          "flex items-center gap-1",
                          overdue ? "text-rose-600 font-medium" :
                          dueLabel.includes("remaining") ? "text-amber-600" : "",
                        ].join(" ")}>
                          <Calendar size={11} />
                          {dueLabel}
                        </span>
                      )}
                      {task.startedAt && (
                        <span className="flex items-center gap-1">
                          <PlayCircle size={11} />
                          Started {fmtDateTime(task.startedAt)}
                        </span>
                      )}
                      {task.completedAt && (
                        <span className={["flex items-center gap-1", late ? "text-warning" : "text-success"].join(" ")}>
                          <CheckCircle2 size={11} />
                          {late ? "Completed late" : "Completed"} {fmtDateTime(task.completedAt)}
                        </span>
                      )}
                      {overdue && task.dueDate && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <Clock size={11} />
                          Due {buildDueDate(task.dueDate, task.dueTime)?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {task.dueTime && ` ${new Date(`1970-01-01T${task.dueTime}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

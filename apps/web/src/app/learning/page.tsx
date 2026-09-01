"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Trash2, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { createTask, getTasks, updateTaskStatus, deleteTask } from "@/src/lib/learning";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import { Textarea } from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import EmptyState from "@/src/components/ui/EmptyState";
import { InlineLoader } from "@/src/components/ui/LoadingSpinner";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  createdAt: string;
}

export default function LearningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch {
      toast.error("Load failed", "Could not load your learning tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.warning("Title required", "Enter a task title to continue.");
      return;
    }
    setCreating(true);
    try {
      await createTask(title.trim(), description.trim());
      setTitle("");
      setDescription("");
      toast.success("Task created!", "Your learning task has been added.");
      fetchTasks();
    } catch {
      toast.error("Create failed", "Could not create the task.");
    } finally {
      setCreating(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateTaskStatus(id, "completed");
      toast.success("Task completed!", "Great work — keep going.");
      fetchTasks();
    } catch {
      toast.error("Update failed", "Could not update task status.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.info("Task removed", "The task has been deleted.");
      fetchTasks();
    } catch {
      toast.error("Delete failed", "Could not delete the task.");
    }
  };

  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <BookOpen size={22} className="text-brand-600" />
          Learning Tracker
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Track your learning tasks and stay on top of your goals
        </p>
      </div>

      {/* Create task */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleCreate()}
            placeholder="Task title (e.g. Learn React Hooks)"
            className="w-full rounded-lg border border-border bg-surface text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-text-muted"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreate} loading={creating} leftIcon={<Plus size={14} />}>
              Add Task
            </Button>
          </div>
        </div>
      </Card>

      {loading && <InlineLoader message="Loading tasks…" />}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Circle size={16} className="text-amber-500" />
              <h2 className="font-semibold text-text-primary text-sm">
                In Progress
              </h2>
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </div>
            {pending.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-text-muted">No pending tasks</p>
                <p className="text-xs text-text-muted mt-1">Add a task above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((task) => (
                  <Card key={task._id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="mt-0.5 text-text-muted hover:text-success transition-colors shrink-0"
                        aria-label="Mark complete"
                      >
                        <Circle size={18} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-text-primary truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{task.description}</p>
                        )}
                        <p className="text-[10px] text-text-muted mt-2">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-text-muted hover:text-danger transition-colors shrink-0"
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-success" />
              <h2 className="font-semibold text-text-primary text-sm">Completed</h2>
              <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>
            {completed.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-text-muted">No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completed.map((task) => (
                  <Card key={task._id} className="opacity-75">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-text-secondary line-through truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">{task.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-text-muted hover:text-danger transition-colors shrink-0"
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

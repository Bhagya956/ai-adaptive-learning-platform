import { Response } from "express";
import Learning from "../models/learning.model";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning
// ─────────────────────────────────────────────────────────────────────────────
export const createTask = async (req: any, res: Response) => {
  try {
    const { title, description, dueDate, dueTime } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Learning.create({
      userId: req.user.id,
      title,
      description: description ?? "",
      dueDate: dueDate ?? null,
      dueTime: dueTime ?? null,
      status: "open",
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning
// ─────────────────────────────────────────────────────────────────────────────
export const getTasks = async (req: any, res: Response) => {
  try {
    const tasks = await Learning.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/learning/:id
// Accepts status: "open" | "wip" | "completed" | "pending" (legacy alias for open)
// ─────────────────────────────────────────────────────────────────────────────
export const updateTaskStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const validStatuses = ["pending", "open", "wip", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Provide a valid status" });
    }

    const task = await Learning.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const prevStatus = task.status;
    task.status = status;

    // Record startedAt when first moved to wip
    if (status === "wip" && prevStatus !== "wip" && !(task as any).startedAt) {
      (task as any).startedAt = new Date();
    }

    // Record completedAt when completed; clear it if reverted
    if (status === "completed") {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update task" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/learning/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTask = async (req: any, res: Response) => {
  try {
    const task = await Learning.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
};

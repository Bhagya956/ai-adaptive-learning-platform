import { Response } from "express";
import Learning from "../models/learning.model";

export const createTask = async (
  req: any,
  res: Response
) => {
  try {
    const {
      title,
      description,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task =
      await Learning.create({
        userId: req.user.id,
        title,
        description,
      });

    return res.status(201).json(
      task
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to create task",
    });
  }
};

export const getTasks = async (
  req: any,
  res: Response
) => {
  try {

    const tasks =
      await Learning.find({
        userId: req.user.id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json(
      tasks
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to fetch tasks",
    });
  }
};

export const updateTaskStatus = async (
  req: any,
  res: Response
) => {
  try {
    const { status } = req.body;

    const taskId = req.params.id;

    const validStatuses = [
      "pending",
      "completed",
    ];

    if (
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Provide valid status",
      });
    }

    const task =
      await Learning.findById(
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    task.status = status;

    if (
      status === "completed"
    ) {
      task.completedAt =
        new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    return res.status(200).json(
      task
    );

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to update task",
    });
  }
};


export const deleteTask = async (
  req: any,
  res: Response
) => {
  try {
    const taskId = req.params.id;

    const task =
      await Learning.findByIdAndDelete(
        taskId
      );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    return res.status(200).json({
      message:
        "Task deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete task",
    });
  }
};
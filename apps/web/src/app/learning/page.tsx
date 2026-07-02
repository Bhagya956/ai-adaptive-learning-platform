"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createTask,
  getTasks,
  updateTaskStatus,
  deleteTask,
} from "@/src/lib/learning";

export default function LearningPage() {
  const [tasks, setTasks] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks =
    async () => {
      try {
        const data =
          await getTasks();

        setTasks(data);
      } catch (error) {
        console.error(error);
      }
    };

  const handleCreateTask =
    async () => {
      if (!title.trim())
        return;

      try {
        await createTask(
          title,
          description
        );

        setTitle("");
        setDescription("");

        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    };

  const handleComplete =
    async (id: string) => {
      try {
        await updateTaskStatus(
          id,
          "completed"
        );

        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    };

  const handleDelete =
    async (id: string) => {
      try {
        await deleteTask(id);

        fetchTasks();
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">
        Learning Tracker
      </h1>

      <div className="border p-4 rounded mb-8">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
          className="border p-2 rounded w-full mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="border p-2 rounded w-full mb-3"
        />

        <button
          onClick={
            handleCreateTask
          }
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task._id}
            className="border p-4 rounded"
          >
            <h2 className="font-bold text-lg">
              {task.title}
            </h2>

            <p>
              {task.description}
            </p>

            <p className="mt-2">
              Status:
              <span className="font-bold ml-2">
                {task.status}
              </span>
            </p>

            <div className="mt-4 flex gap-3">
              {task.status !==
                "completed" && (
                <button
                  onClick={() =>
                    handleComplete(
                      task._id
                    )
                  }
                  className="bg-green-500 text-white px-3 py-2 rounded"
                >
                  Complete
                </button>
              )}

              <button
                onClick={() =>
                  handleDelete(
                    task._id
                  )
                }
                className="bg-red-500 text-white px-3 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
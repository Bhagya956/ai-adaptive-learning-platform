import api from "@/src/services/api";

export const createTask = async (
  title: string,
  description: string
) => {
  const response = await api.post(
    "/learning",
    {
      title,
      description,
    }
  );

  return response.data;
};

export const getTasks = async () => {
  const response = await api.get(
    "/learning"
  );

  return response.data;
};

export const updateTaskStatus =
  async (
    id: string,
    status: string
  ) => {
    const response =
      await api.put(
        `/learning/${id}`,
        { status }
      );

    return response.data;
  };

export const deleteTask =
  async (id: string) => {
    const response =
      await api.delete(
        `/learning/${id}`
      );

    return response.data;
  };
import api from "../services/api";

export const getRoadmapHistory =
  async () => {
    const response =
      await api.get(
        "/ai/roadmaps"
      );

    return response.data;
  };
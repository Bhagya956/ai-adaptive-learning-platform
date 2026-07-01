import api from "../services/api";

export const getInterviewHistory =
  async () => {
    const response =
      await api.get(
        "/interview-prep/history"
      );

    return response.data;
  };
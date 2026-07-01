import api from "../services/api";

export const getSkillGapHistory =
  async () => {
    const response =
      await api.get(
        "/skill-gap/history"
      );

    return response.data;
  };
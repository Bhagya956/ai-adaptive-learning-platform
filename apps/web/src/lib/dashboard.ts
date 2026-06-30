// import api from "./api";
import api from "../services/api";

export const getDashboardStats =
  async () => {
    const response =
      await api.get(
        "/dashboard/stats"
      );

    return response.data;
  };

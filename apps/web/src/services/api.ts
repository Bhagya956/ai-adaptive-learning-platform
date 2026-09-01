import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  (config) => {
    try {
      const token =
        JSON.parse(
          localStorage.getItem("auth-storage") || "{}"
        )?.state?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // localStorage unavailable or malformed — proceed without auth header
    }

    return config;
  }
);

export default api;
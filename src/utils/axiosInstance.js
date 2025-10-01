// src/utils/axiosInstance.js
import axios from "axios";
import { refreshAccessToken } from "./refreshAccessToken";
const isDevelopment = import.meta.env.MODE === "development";

const myBaseURL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL   // ex: "http://127.0.0.1:8000/api"
  : import.meta.env.VITE_API_BASE_URL_DEPLOY; 

const axiosInstance = axios.create({
  baseURL: myBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔄 Intercept requests to attach access token
axiosInstance.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// 🚨 Intercept responses to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // 🔄 Try refresh if 401
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } else {
        localStorage.clear();
        window.location.href = "/error";
        return Promise.reject(error);
      }
    }

    // 🚦 Redirect based on error code
    switch (status) {
      case 403:
        window.location.href = "/error";
        break;
      case 404:
        window.location.href = "/error";
        break;
      case 500:
        window.location.href = "/error";
        break;
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

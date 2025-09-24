import axios from "axios";

// Use environment variable or fallback to localhost for development
const baseURL = import.meta.env.VITE_API_BASE_URL || 
                "http://localhost:8000/api/v1";

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default API;
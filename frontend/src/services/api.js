import axios from "axios";
export const SESSION_KEY = "coffee_house_session_v2";
export function savedSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = savedSession()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !/auth\/(login|register)/.test(error.config?.url || "")
    ) {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new Event("coffee-session-expired"));
    }
    return Promise.reject(error);
  },
);
export const errorMessage = (error) =>
  error.response?.data?.message ||
  (error.code === "ECONNABORTED"
    ? "The server took too long. Please try again."
    : "Cannot connect to the server. Check that the backend is running.");
export default api;

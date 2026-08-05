import axios from "axios";
import { tPlain } from "../i18n/LanguageContext";

const TOKEN_KEY = "zpadel_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(error) {
  const data = error?.response?.data;
  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0];
    return { message: data.errors[firstField]?.[0] || data.title || tPlain("errors.invalidData"), details: data };
  }
  if (data?.detail) return { message: data.detail, details: data };
  if (data?.title) return { message: data.title, details: data };
  return { message: tPlain("errors.generic"), details: null };
}

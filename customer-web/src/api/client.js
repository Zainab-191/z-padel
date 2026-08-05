import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api",
  headers: { "Content-Type": "application/json" },
});

/** Normalizes our ProblemDetails-shaped error responses into a plain message + optional details. */
export function extractApiError(error) {
  const data = error?.response?.data;
  if (data?.errors) {
    // FluentValidation-style ValidationProblemDetails: { errors: { field: [msg, ...] } }
    const firstField = Object.keys(data.errors)[0];
    return { message: data.errors[firstField]?.[0] || data.title || "بيانات غير صحيحة", details: data };
  }
  if (data?.detail) return { message: data.detail, details: data };
  if (data?.title) return { message: data.title, details: data };
  return { message: "حدث خطأ غير متوقع، حاول مرة أخرى.", details: null };
}

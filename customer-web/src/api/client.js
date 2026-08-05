import axios from "axios";
import { tPlain } from "../i18n/LanguageContext";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5100/api",
  headers: { "Content-Type": "application/json" },
});

/** Normalizes our ProblemDetails-shaped error responses into a plain message + optional details.
 * The API's own messages come back in English regardless of UI language (not localized server-side);
 * only our generic fallbacks are translated here. */
export function extractApiError(error) {
  const data = error?.response?.data;
  if (data?.errors) {
    // FluentValidation-style ValidationProblemDetails: { errors: { field: [msg, ...] } }
    const firstField = Object.keys(data.errors)[0];
    return { message: data.errors[firstField]?.[0] || data.title || tPlain("errors.invalidData"), details: data };
  }
  if (data?.detail) return { message: data.detail, details: data };
  if (data?.title) return { message: data.title, details: data };
  return { message: tPlain("errors.generic"), details: null };
}

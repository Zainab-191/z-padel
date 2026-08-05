import { apiClient } from "./client";

export async function login(username, password) {
  const { data } = await apiClient.post("/admin/auth/login", { username, password });
  return data;
}

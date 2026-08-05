import { apiClient } from "./client";

export async function getAvailability(date) {
  const { data } = await apiClient.get("/availability", { params: { date } });
  return data;
}

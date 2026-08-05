import { apiClient } from "./client";

export async function getCourts() {
  const { data } = await apiClient.get("/admin/courts");
  return data;
}

export async function createCourt(dto) {
  const { data } = await apiClient.post("/admin/courts", dto);
  return data;
}

export async function updateCourt(id, dto) {
  const { data } = await apiClient.put(`/admin/courts/${id}`, dto);
  return data;
}

export async function deleteCourt(id) {
  await apiClient.delete(`/admin/courts/${id}`);
}

export async function setPricingTiers(id, tiers) {
  const { data } = await apiClient.put(`/admin/courts/${id}/pricing-tiers`, { tiers });
  return data;
}

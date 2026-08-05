import { apiClient } from "./client";

export async function getClosures() {
  const { data } = await apiClient.get("/admin/closures");
  return data;
}

export async function createClosure(dto) {
  const { data } = await apiClient.post("/admin/closures", dto);
  return data;
}

export async function deleteClosure(id) {
  await apiClient.delete(`/admin/closures/${id}`);
}

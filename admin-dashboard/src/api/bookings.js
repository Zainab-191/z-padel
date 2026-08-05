import { apiClient } from "./client";

export async function getBookings(filter) {
  const params = {};
  if (filter.courtId) params.courtId = filter.courtId;
  if (filter.date) params.date = filter.date;
  if (filter.status !== "" && filter.status !== undefined) params.status = filter.status;
  if (filter.paymentMethod !== "" && filter.paymentMethod !== undefined) params.paymentMethod = filter.paymentMethod;
  if (filter.phone) params.phone = filter.phone;

  const { data } = await apiClient.get("/admin/bookings", { params });
  return data;
}

export async function cancelBooking(bookingId) {
  await apiClient.post(`/admin/bookings/${bookingId}/cancel`);
}

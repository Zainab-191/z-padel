import { apiClient } from "./client";

export async function quoteBooking(slots) {
  const { data } = await apiClient.post("/bookings/quote", { slots });
  return data;
}

export async function createBooking(payload) {
  const { data } = await apiClient.post("/bookings", payload);
  return data;
}

export async function getBookingByReference(reference) {
  const { data } = await apiClient.get(`/bookings/${encodeURIComponent(reference)}`);
  return data;
}

export async function initiateThawaniPayment(reference) {
  const { data } = await apiClient.post(`/bookings/${encodeURIComponent(reference)}/pay/thawani`);
  return data;
}

export async function confirmThawaniPayment(reference) {
  const { data } = await apiClient.post(`/bookings/${encodeURIComponent(reference)}/confirm-thawani-payment`);
  return data;
}

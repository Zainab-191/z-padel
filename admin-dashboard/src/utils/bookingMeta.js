export const STATUS_CLASS = {
  0: "bg-amber-100 text-amber-800",
  1: "bg-court-100 text-court-800",
  2: "bg-gray-200 text-gray-600",
  3: "bg-gray-200 text-gray-600",
  4: "bg-red-100 text-red-700",
};

export function buildStatusOptions(dict) {
  return [
    { value: "", label: dict.bookings.allStatuses },
    ...Object.entries(dict.status).map(([value, label]) => ({ value: Number(value), label })),
  ];
}

export function buildPaymentMethodOptions(dict) {
  return [
    { value: "", label: dict.bookings.allPaymentMethods },
    ...Object.entries(dict.paymentMethod).map(([value, label]) => ({ value: Number(value), label })),
  ];
}

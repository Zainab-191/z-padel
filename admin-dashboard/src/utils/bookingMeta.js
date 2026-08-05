export const STATUS_META = {
  0: { label: "بانتظار الدفع", className: "bg-amber-100 text-amber-800" },
  1: { label: "مؤكد", className: "bg-court-100 text-court-800" },
  2: { label: "ملغى (إدارة)", className: "bg-gray-200 text-gray-600" },
  3: { label: "منتهي", className: "bg-gray-200 text-gray-600" },
  4: { label: "فشل الدفع", className: "bg-red-100 text-red-700" },
};

export const PAYMENT_METHOD_META = {
  0: "عند الوصول",
  1: "ثواني",
};

export const STATUS_OPTIONS = [
  { value: "", label: "كل الحالات" },
  { value: 0, label: "بانتظار الدفع" },
  { value: 1, label: "مؤكد" },
  { value: 2, label: "ملغى (إدارة)" },
  { value: 3, label: "منتهي" },
  { value: 4, label: "فشل الدفع" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "كل طرق الدفع" },
  { value: 0, label: "عند الوصول" },
  { value: 1, label: "ثواني" },
];

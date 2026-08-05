import { useState } from "react";

const emptyForm = { name: "", description: "", openingTime: "08:00", closingTime: "23:00", basePricePerHour: "" };

export default function CourtForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial ? { ...initial } : emptyForm);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description?.trim() || null,
      openingTime: `${form.openingTime}:00`,
      closingTime: `${form.closingTime}:00`,
      basePricePerHour: Number(form.basePricePerHour),
      ...(initial ? { isActive: form.isActive } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-xl bg-court-50 p-4">
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-600">اسم الملعب</label>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-xs text-gray-600">وصف (اختياري)</label>
        <input
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-600">وقت الفتح</label>
        <input
          type="time"
          required
          value={form.openingTime}
          onChange={(e) => set("openingTime", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-600">وقت الإغلاق</label>
        <input
          type="time"
          required
          value={form.closingTime}
          onChange={(e) => set("closingTime", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-600">السعر الأساسي للساعة (ر.ع)</label>
        <input
          type="number"
          min={0}
          step="0.001"
          required
          value={form.basePricePerHour}
          onChange={(e) => set("basePricePerHour", e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        />
      </div>
      {initial && (
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            نشط
          </label>
        </div>
      )}
      <div className="col-span-2 flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-lg px-4 py-1.5 text-sm text-gray-600">
          إلغاء
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-court-600 px-4 py-1.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {submitting ? "جارٍ الحفظ..." : "حفظ"}
        </button>
      </div>
    </form>
  );
}

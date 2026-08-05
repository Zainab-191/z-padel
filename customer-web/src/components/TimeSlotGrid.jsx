import { formatOMR, formatTime } from "../utils/format";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../i18n/LanguageContext";

export default function TimeSlotGrid({ date, slots, loading, error }) {
  const { toggleSlot, has } = useCart();
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-court-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (slots.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{t("home.noSlots")}</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const selected = has(date, slot.startTime);
        return (
          <button
            key={slot.startTime}
            type="button"
            onClick={() => toggleSlot({ date, startTime: slot.startTime, endTime: slot.endTime, estimatedPricePerHour: slot.estimatedPricePerHour })}
            className={`flex flex-col items-center rounded-xl border px-2 py-3 text-sm font-medium transition ${
              selected
                ? "border-court-600 bg-court-600 text-white shadow-md"
                : "border-court-200 bg-white text-court-900 hover:border-court-400"
            }`}
          >
            <span>{formatTime(slot.startTime, language)}</span>
            <span className={`mt-1 text-xs ${selected ? "text-court-100" : "text-gray-400"}`}>
              {formatOMR(slot.estimatedPricePerHour, language)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

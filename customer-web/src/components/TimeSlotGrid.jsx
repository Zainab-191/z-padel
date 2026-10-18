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
          <div key={i} className="h-[68px] animate-pulse rounded-xl bg-court-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
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
            aria-pressed={selected}
            onClick={() => toggleSlot({ date, startTime: slot.startTime, endTime: slot.endTime, estimatedPricePerHour: slot.estimatedPricePerHour })}
            className={`relative flex min-h-[68px] flex-col items-center justify-center rounded-xl border px-2 py-3 text-sm font-medium transition active:scale-[0.97] ${
              selected
                ? "border-court-600 bg-court-600 text-white"
                : "border-court-200 bg-white text-court-900 hover:border-court-400"
            }`}
          >
            {selected && (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute end-1.5 top-1.5 h-3.5 w-3.5 fill-none stroke-white stroke-[2.2]">
                <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>{formatTime(slot.startTime, language)}</span>
            <span className={`mt-1 text-xs ${selected ? "text-white/85" : "text-gray-600"}`}>
              {formatOMR(slot.estimatedPricePerHour, language)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

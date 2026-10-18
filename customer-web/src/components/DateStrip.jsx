import { useLanguage } from "../i18n/LanguageContext";
import { addDaysIso, todayIso } from "../utils/format";

export default function DateStrip({ value, onChange, days = 21 }) {
  const { t, dict } = useLanguage();
  const today = todayIso();
  const dates = Array.from({ length: days }, (_, i) => addDaysIso(today, i));

  return (
    <div className="space-y-2">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]" role="group" aria-label={t("home.otherDate")}>
        {dates.map((iso) => {
          const [, m, d] = iso.split("-").map(Number);
          const dow = new Date(iso).getDay();
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              className={`flex min-h-[76px] min-w-14 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2 transition active:scale-[0.97] ${
                selected
                  ? "border-court-600 bg-court-600 text-white"
                  : "border-court-200 bg-white text-court-900 hover:border-court-400"
              }`}
            >
              <span className="text-xs">{dict.weekdaysShort[dow]}</span>
              <span className="text-lg font-semibold">{d}</span>
              <span className="text-xs opacity-75">{m}</span>
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-sm text-court-700">
        <span>{t("home.otherDate")}</span>
        <input
          type="date"
          value={value}
          min={today}
          max={addDaysIso(today, 60)}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="min-h-11 rounded-lg border border-court-200 bg-white px-3"
        />
      </label>
    </div>
  );
}

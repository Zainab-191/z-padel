import { addDaysIso, todayIso } from "../utils/format";

const WEEKDAY_SHORT_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export default function DateStrip({ value, onChange, days = 21 }) {
  const today = todayIso();
  const dates = Array.from({ length: days }, (_, i) => addDaysIso(today, i));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {dates.map((iso) => {
          const [, m, d] = iso.split("-").map(Number);
          const dow = new Date(iso).getDay();
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange(iso)}
              className={`flex min-w-14 flex-col items-center rounded-xl border px-3 py-2 transition ${
                selected
                  ? "border-court-600 bg-court-600 text-white"
                  : "border-court-200 bg-white text-court-900 hover:border-court-400"
              }`}
            >
              <span className="text-xs">{WEEKDAY_SHORT_AR[dow]}</span>
              <span className="text-lg font-bold">{d}</span>
              <span className="text-[10px] opacity-70">{m}</span>
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-sm text-court-700">
        <span>أو اختر تاريخاً آخر:</span>
        <input
          type="date"
          value={value}
          min={today}
          max={addDaysIso(today, 60)}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="rounded-lg border border-court-200 px-2 py-1"
        />
      </label>
    </div>
  );
}

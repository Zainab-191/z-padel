import { translations } from "../i18n/translations";

/** @param {string} isoDate e.g. "2026-08-05" */
export function formatDateLong(isoDate, lang) {
  const dict = translations[lang];
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return `${dict.weekdaysLong[dt.getDay()]} ${d} ${dict.months[m - 1]}`;
}

export function formatDateShort(isoDate, lang) {
  const dict = translations[lang];
  const [, m, d] = isoDate.split("-").map(Number);
  return `${d} ${dict.months[m - 1]}`;
}

/** @param {string} time e.g. "14:00:00" */
export function formatTime(time, lang) {
  const dict = translations[lang];
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? dict.am : dict.pm;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatOMR(amount, lang) {
  const dict = translations[lang];
  return `${Number(amount).toFixed(3)} ${dict.currency}`;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysIso(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

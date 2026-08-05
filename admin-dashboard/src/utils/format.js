import { translations } from "../i18n/translations";

export function formatOMR(amount, lang) {
  const dict = translations[lang];
  return `${Number(amount).toFixed(3)} ${dict.currency}`;
}

export function formatTime(time, lang) {
  if (!time) return "";
  const dict = translations[lang];
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? dict.am : dict.pm;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}:00 ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();
  const next = language === "ar" ? "en" : "ar";
  const label = language === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      className={`rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 ${className}`}
    >
      {label}
    </button>
  );
}

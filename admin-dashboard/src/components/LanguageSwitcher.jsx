import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();
  const next = language === "ar" ? "en" : "ar";
  const label = language === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      className={`text-xs font-medium text-court-100/80 underline hover:text-white ${className}`}
    >
      {label}
    </button>
  );
}

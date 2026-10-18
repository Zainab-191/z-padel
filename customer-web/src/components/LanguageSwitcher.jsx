import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage } = useLanguage();
  const next = language === "ar" ? "en" : "ar";
  const label = language === "ar" ? "English" : "العربية";

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      lang={next}
      className={`inline-flex min-h-11 items-center rounded-full border border-court-200 px-4 text-sm font-medium text-court-900 transition hover:bg-court-100 ${className}`}
    >
      {label}
    </button>
  );
}

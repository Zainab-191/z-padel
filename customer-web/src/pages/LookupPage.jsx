import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export default function LookupPage() {
  const { t } = useLanguage();
  const [reference, setReference] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (reference.trim()) navigate(`/booking/${reference.trim().toUpperCase()}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold text-court-900">{t("lookup.title")}</h1>
      <p className="mb-6 text-center text-sm text-gray-600">{t("lookup.subtitle")}</p>
      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <label htmlFor="booking-ref" className="sr-only">{t("lookup.title")}</label>
        <input
          id="booking-ref"
          autoComplete="off"
          autoCapitalize="characters"
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="ZP-XXXXXX"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-court-200 bg-white px-4 text-center font-mono text-base focus:border-court-600"
          dir="ltr"
        />
        <button type="submit" className="min-h-12 rounded-full bg-court-600 px-6 font-semibold text-white transition hover:bg-court-500">
          {t("lookup.search")}
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function PricingTiersEditor({ tiers, onSave, saving }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState(
    tiers.length > 0 ? tiers.map((tier) => ({ minHours: tier.minHours, pricePerHour: tier.pricePerHour })) : [],
  );

  function addRow() {
    setRows((r) => [...r, { minHours: r.length + 1, pricePerHour: "" }]);
  }

  function updateRow(index, field, value) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && <p className="text-xs text-gray-400">{t("courts.noTiers")}</p>}
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t("courts.fromHours")}</span>
          <input
            type="number"
            min={1}
            value={row.minHours}
            onChange={(e) => updateRow(i, "minHours", Number(e.target.value))}
            className="w-16 rounded border border-gray-200 px-2 py-1 text-sm"
          />
          <span className="text-xs text-gray-500">{t("courts.hoursPrice")}</span>
          <input
            type="number"
            min={0}
            step="0.001"
            value={row.pricePerHour}
            onChange={(e) => updateRow(i, "pricePerHour", e.target.value)}
            className="w-24 rounded border border-gray-200 px-2 py-1 text-sm"
          />
          <span className="text-xs text-gray-500">{t("courts.pricePerHourUnit")}</span>
          <button onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700" type="button">
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={addRow} className="text-xs font-medium text-court-700 underline">
          {t("courts.addOffer")}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            onSave(rows.map((r) => ({ minHours: Number(r.minHours), pricePerHour: Number(r.pricePerHour) })))
          }
          className="rounded-full bg-court-600 px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
        >
          {saving ? t("courts.savingOffers") : t("courts.saveOffers")}
        </button>
      </div>
    </div>
  );
}

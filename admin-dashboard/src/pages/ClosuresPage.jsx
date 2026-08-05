import { useEffect, useState } from "react";
import { createClosure, deleteClosure, getClosures } from "../api/closures";
import { getCourts } from "../api/courts";
import { extractApiError } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatTime, todayIso } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

const emptyForm = {
  scope: "all", // "all" | "some"
  courtIds: [],
  startDate: todayIso(),
  endDate: todayIso(),
  partialDay: false,
  startTime: "08:00",
  endTime: "23:00",
  reason: "",
};

export default function ClosuresPage() {
  const { t, language } = useLanguage();
  const [closures, setClosures] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    Promise.all([getClosures(), getCourts()])
      .then(([c, courtsList]) => {
        setClosures(c);
        setCourts(courtsList);
      })
      .catch((err) => setError(extractApiError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCourt(id) {
    setForm((f) => ({
      ...f,
      courtIds: f.courtIds.includes(id) ? f.courtIds.filter((c) => c !== id) : [...f.courtIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createClosure({
        courtIds: form.scope === "all" ? null : form.courtIds,
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.partialDay ? `${form.startTime}:00` : null,
        endTime: form.partialDay ? `${form.endTime}:00` : null,
        reason: form.reason.trim() || null,
      });
      setForm(emptyForm);
      setCreating(false);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteClosure(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-court-900">{t("closures.title")}</h1>
        <button
          onClick={() => setCreating((c) => !c)}
          className="rounded-full bg-court-600 px-4 py-2 text-sm font-bold text-white hover:bg-court-700"
        >
          {creating ? t("closures.closeForm") : t("closures.addClosure")}
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {creating && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">{t("closures.scopeLabel")}</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={form.scope === "all"} onChange={() => set("scope", "all")} />
                {t("closures.allCourts")}
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" checked={form.scope === "some"} onChange={() => set("scope", "some")} />
                {t("closures.someCourts")}
              </label>
            </div>
            {form.scope === "some" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {courts.map((c) => (
                  <label
                    key={c.id}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                      form.courtIds.includes(c.id) ? "border-court-600 bg-court-50 text-court-800" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.courtIds.includes(c.id)}
                      onChange={() => toggleCourt(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">{t("closures.fromDate")}</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-600">{t("closures.toDate")}</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.partialDay} onChange={(e) => set("partialDay", e.target.checked)} />
            {t("closures.partialDay")}
          </label>

          {form.partialDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-600">{t("closures.fromTime")}</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">{t("closures.toTime")}</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-gray-600">{t("closures.reason")}</label>
            <input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-court-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {submitting ? t("closures.saving") : t("closures.save")}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">{t("common.loading")}</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-start text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">{t("closures.colCourt")}</th>
                <th className="px-4 py-2 font-medium">{t("closures.colFrom")}</th>
                <th className="px-4 py-2 font-medium">{t("closures.colTo")}</th>
                <th className="px-4 py-2 font-medium">{t("closures.colTime")}</th>
                <th className="px-4 py-2 font-medium">{t("closures.colReason")}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {closures.map((c) => (
                <tr key={c.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{c.courtName || t("closures.allCourts")}</td>
                  <td className="px-4 py-2">{c.startDate}</td>
                  <td className="px-4 py-2">{c.endDate}</td>
                  <td className="px-4 py-2">
                    {c.startTime
                      ? `${formatTime(c.startTime, language)} - ${formatTime(c.endTime, language)}`
                      : t("closures.allDay")}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{c.reason || "—"}</td>
                  <td className="px-4 py-2 text-end">
                    <button onClick={() => setDeleteTarget(c)} className="text-red-600 underline">
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {closures.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    {t("closures.noClosures")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("closures.deleteTitle")}
        message={t("closures.deleteMessage")}
        confirmLabel={t("common.delete")}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

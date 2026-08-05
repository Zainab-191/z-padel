import { useEffect, useState } from "react";
import { cancelBooking, getBookings } from "../api/bookings";
import { getCourts } from "../api/courts";
import { extractApiError } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatOMR, formatTime } from "../utils/format";
import { buildPaymentMethodOptions, buildStatusOptions, STATUS_CLASS } from "../utils/bookingMeta";
import { useLanguage } from "../i18n/LanguageContext";

const emptyFilter = { courtId: "", date: "", status: "", paymentMethod: "", phone: "" };

export default function BookingsPage() {
  const { t, dict, language } = useLanguage();
  const [courts, setCourts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(emptyFilter);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const statusOptions = buildStatusOptions(dict);
  const paymentMethodOptions = buildPaymentMethodOptions(dict);

  useEffect(() => {
    getCourts().then(setCourts).catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    getBookings(filter)
      .then(setRows)
      .catch((err) => setError(extractApiError(err).message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.bookingId);
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(extractApiError(err).message);
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold text-court-900">{t("bookings.title")}</h1>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-5">
        <select
          value={filter.courtId}
          onChange={(e) => setFilter((f) => ({ ...f, courtId: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        >
          <option value="">{t("bookings.allCourts")}</option>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filter.date}
          onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        />

        <select
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={filter.paymentMethod}
          onChange={(e) => setFilter((f) => ({ ...f, paymentMethod: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        >
          {paymentMethodOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder={t("bookings.phonePlaceholder")}
          value={filter.phone}
          onChange={(e) => setFilter((f) => ({ ...f, phone: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          dir="ltr"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-gray-50 text-start text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">{t("bookings.colReference")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colCourt")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colDate")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colTime")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colPrice")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colStatus")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colPayment")}</th>
              <th className="px-4 py-2 font-medium">{t("bookings.colCustomer")}</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.bookingId + r.courtId + r.startTime} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs">{r.reference}</td>
                  <td className="px-4 py-2">{r.courtName}</td>
                  <td className="px-4 py-2">{r.date}</td>
                  <td className="px-4 py-2">{formatTime(r.startTime, language)}</td>
                  <td className="px-4 py-2">{formatOMR(r.price, language)}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[r.status] ?? STATUS_CLASS[0]}`}>
                      {dict.status[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2">{dict.paymentMethod[r.paymentMethod]}</td>
                  <td className="px-4 py-2" dir="ltr">
                    <div>{r.guestPhone}</div>
                    {r.guestName && <div className="text-xs text-gray-400">{r.guestName}</div>}
                  </td>
                  <td className="px-4 py-2 text-end">
                    {(r.status === 0 || r.status === 1) && (
                      <button onClick={() => setCancelTarget(r)} className="text-red-600 underline">
                        {t("bookings.cancelAction")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                  {t("bookings.noBookings")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title={t("bookings.cancelDialogTitle")}
        message={t("bookings.cancelDialogMessage", { ref: cancelTarget?.reference })}
        confirmLabel={cancelling ? t("bookings.cancelling") : t("bookings.cancelDialogTitle")}
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

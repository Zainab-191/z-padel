import { useEffect, useState } from "react";
import { cancelBooking, getBookings } from "../api/bookings";
import { getCourts } from "../api/courts";
import { extractApiError } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatOMR, formatTime } from "../utils/format";
import { PAYMENT_METHOD_META, PAYMENT_METHOD_OPTIONS, STATUS_META, STATUS_OPTIONS } from "../utils/bookingMeta";

const emptyFilter = { courtId: "", date: "", status: "", paymentMethod: "", phone: "" };

export default function BookingsPage() {
  const [courts, setCourts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(emptyFilter);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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
      <h1 className="mb-6 text-xl font-extrabold text-court-900">الحجوزات</h1>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-5">
        <select
          value={filter.courtId}
          onChange={(e) => setFilter((f) => ({ ...f, courtId: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
        >
          <option value="">كل الملاعب</option>
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
          {STATUS_OPTIONS.map((o) => (
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
          {PAYMENT_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="رقم الهاتف"
          value={filter.phone}
          onChange={(e) => setFilter((f) => ({ ...f, phone: e.target.value }))}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
          dir="ltr"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-gray-50 text-right text-xs text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">المرجع</th>
              <th className="px-4 py-2 font-medium">الملعب</th>
              <th className="px-4 py-2 font-medium">التاريخ</th>
              <th className="px-4 py-2 font-medium">الوقت</th>
              <th className="px-4 py-2 font-medium">السعر</th>
              <th className="px-4 py-2 font-medium">الحالة</th>
              <th className="px-4 py-2 font-medium">الدفع</th>
              <th className="px-4 py-2 font-medium">العميل</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                  جارٍ التحميل...
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => {
                const status = STATUS_META[r.status] ?? STATUS_META[0];
                return (
                  <tr key={r.bookingId + r.courtId + r.startTime} className="border-t border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs">{r.reference}</td>
                    <td className="px-4 py-2">{r.courtName}</td>
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2">{formatTime(r.startTime)}</td>
                    <td className="px-4 py-2">{formatOMR(r.price)}</td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2">{PAYMENT_METHOD_META[r.paymentMethod]}</td>
                    <td className="px-4 py-2" dir="ltr">
                      <div>{r.guestPhone}</div>
                      {r.guestName && <div className="text-xs text-gray-400">{r.guestName}</div>}
                    </td>
                    <td className="px-4 py-2 text-left">
                      {(r.status === 0 || r.status === 1) && (
                        <button onClick={() => setCancelTarget(r)} className="text-red-600 underline">
                          إلغاء
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                  لا توجد حجوزات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="إلغاء الحجز"
        message={`هل أنت متأكد من إلغاء الحجز ${cancelTarget?.reference}؟ سيتم تحرير كل الأوقات المرتبطة به.`}
        confirmLabel={cancelling ? "جارٍ الإلغاء..." : "إلغاء الحجز"}
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}

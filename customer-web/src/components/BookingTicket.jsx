import { formatDateShort, formatOMR, formatTime } from "../utils/format";
import { PAYMENT_METHOD_META, STATUS_META } from "../utils/bookingMeta";

export default function BookingTicket({ booking }) {
  const status = STATUS_META[booking.status] ?? STATUS_META[0];

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Stub */}
        <div className="court-lines-bg px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">رقم الحجز</p>
              <p className="font-mono text-2xl font-extrabold tracking-wider">{booking.reference}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-0 border-t-2 border-dashed border-court-200">
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-court-50" />
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-court-50" />
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">الأوقات المحجوزة</p>
            <ul className="space-y-2">
              {booking.slots.map((s) => (
                <li
                  key={`${s.date}_${s.startTime}`}
                  className="flex items-center justify-between rounded-lg bg-court-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-court-900">
                    {formatDateShort(s.date)} · {formatTime(s.startTime)} - {formatTime(s.endTime)}
                  </span>
                  <span className="font-mono text-court-700">{formatOMR(s.price)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
            <span className="text-sm text-gray-500">{PAYMENT_METHOD_META[booking.paymentMethod]}</span>
            <span className="text-lg font-extrabold text-court-900">{formatOMR(booking.totalAmount)}</span>
          </div>

          {booking.status === 0 && booking.expiresAt && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
              يجب إتمام الدفع خلال 10 دقائق من إنشاء الحجز وإلا سيتم إلغاؤه تلقائياً
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

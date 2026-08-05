import { formatDateShort, formatOMR, formatTime } from "../utils/format";
import { STATUS_CLASS } from "../utils/bookingMeta";
import { useLanguage } from "../i18n/LanguageContext";

export default function BookingTicket({ booking }) {
  const { t, dict, language } = useLanguage();
  const statusClass = STATUS_CLASS[booking.status] ?? STATUS_CLASS[0];
  const statusLabel = dict.status[booking.status] ?? dict.status[0];

  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        {/* Stub */}
        <div className="court-lines-bg px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70">{t("ticket.bookingRef")}</p>
              <p className="font-mono text-2xl font-extrabold tracking-wider" dir="ltr">
                {booking.reference}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}>{statusLabel}</span>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative h-0 border-t-2 border-dashed border-court-200">
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-court-50" />
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-court-50" />
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">{t("ticket.bookedTimes")}</p>
            <ul className="space-y-2">
              {booking.slots.map((s) => (
                <li
                  key={`${s.date}_${s.startTime}`}
                  className="flex items-center justify-between rounded-lg bg-court-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-court-900">
                    {formatDateShort(s.date, language)} · {formatTime(s.startTime, language)} -{" "}
                    {formatTime(s.endTime, language)}
                  </span>
                  <span className="font-mono text-court-700">{formatOMR(s.price, language)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
            <span className="text-sm text-gray-500">{dict.paymentMethodLabel[booking.paymentMethod]}</span>
            <span className="text-lg font-extrabold text-court-900">{formatOMR(booking.totalAmount, language)}</span>
          </div>

          {booking.status === 0 && booking.expiresAt && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
              {t("ticket.expiryNotice")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

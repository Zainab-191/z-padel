import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingTicket from "../components/BookingTicket";
import { confirmThawaniPayment } from "../api/bookings";
import { extractApiError } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";

export default function ThawaniSuccessPage() {
  const { reference } = useParams();
  const { t } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    confirmThawaniPayment(reference)
      .then(setBooking)
      .catch((err) => setError(extractApiError(err).message))
      .finally(() => setLoading(false));
  }, [reference]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {loading && <p role="status" className="text-center text-gray-600">{t("thawaniSuccess.verifying")}</p>}

      {error && (
        <div className="text-center">
          <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
          <Link to="/" className="inline-flex min-h-11 items-center text-court-600 underline-offset-4 hover:underline">
            {t("common.back")}
          </Link>
        </div>
      )}

      {booking && (
        <>
          {booking.status === 1 ? (
            <p className="mb-6 flex items-center justify-center gap-2 text-lg font-semibold text-court-900">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 rounded-full bg-court-600 p-1.5 fill-none stroke-white stroke-[2.5]">
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("thawaniSuccess.confirmed")}
            </p>
          ) : (
            <p className="mb-6 text-center text-lg font-semibold text-red-700">{t("thawaniSuccess.failed")}</p>
          )}
          <BookingTicket booking={booking} />
          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex min-h-11 items-center text-sm text-court-600 underline-offset-4 hover:underline">
              {t("common.back")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

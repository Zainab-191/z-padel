import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBookingByReference, initiateThawaniPayment } from "../api/bookings";
import { extractApiError } from "../api/client";
import { formatOMR } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

export default function ThawaniCancelledPage() {
  const { reference } = useParams();
  const { t, language } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    getBookingByReference(reference)
      .then(setBooking)
      .catch((err) => setError(extractApiError(err).message));
  }, [reference]);

  async function retry() {
    setRetrying(true);
    setError(null);
    try {
      const { checkoutUrl } = await initiateThawaniPayment(reference);
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(extractApiError(err).message);
      setRetrying(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto mb-3 h-12 w-12 rounded-full bg-white p-3 fill-court-900">
        <rect x="6" y="5" width="4" height="14" rx="1.2" />
        <rect x="14" y="5" width="4" height="14" rx="1.2" />
      </svg>
      <h1 className="mb-2 text-2xl font-semibold text-court-900">{t("thawaniCancelled.title")}</h1>
      <p className="mb-6 text-sm text-gray-600">
        {(() => {
          const [before, after] = t("thawaniCancelled.message").split("{{ref}}");
          return (
            <>
              {before}
              <span className="font-mono" dir="ltr">
                {reference}
              </span>
              {after}
            </>
          );
        })()}
      </p>

      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {booking?.status === 0 && (
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="mb-3 min-h-12 w-full rounded-full bg-ball-500 font-semibold transition hover:bg-ball-600 disabled:opacity-50"
        >
          {retrying ? t("thawaniCancelled.retrying") : `${t("thawaniCancelled.retry")} — ${booking ? formatOMR(booking.totalAmount, language) : ""}`}
        </button>
      )}

      <Link to="/" className="inline-flex min-h-11 items-center text-sm text-court-600 underline-offset-4 hover:underline">
        {t("common.back")}
      </Link>
    </div>
  );
}

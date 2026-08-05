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
      <p className="mb-2 text-2xl">⏸</p>
      <h1 className="mb-2 text-lg font-bold text-court-900">{t("thawaniCancelled.title")}</h1>
      <p className="mb-6 text-sm text-gray-500">
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

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {booking?.status === 0 && (
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          className="mb-3 w-full rounded-full bg-ball-500 py-3 font-bold text-court-900 shadow-md disabled:opacity-50"
        >
          {retrying ? t("thawaniCancelled.retrying") : `${t("thawaniCancelled.retry")} — ${booking ? formatOMR(booking.totalAmount, language) : ""}`}
        </button>
      )}

      <Link to="/" className="text-sm text-court-700 underline">
        {t("common.back")}
      </Link>
    </div>
  );
}

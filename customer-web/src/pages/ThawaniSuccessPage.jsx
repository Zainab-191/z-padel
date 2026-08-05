import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingTicket from "../components/BookingTicket";
import { confirmThawaniPayment } from "../api/bookings";
import { extractApiError } from "../api/client";

export default function ThawaniSuccessPage() {
  const { reference } = useParams();
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
      {loading && <p className="text-center text-gray-400">جارٍ التحقق من الدفع...</p>}

      {error && (
        <div className="text-center">
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>
          <Link to="/" className="text-court-700 underline">
            العودة للرئيسية
          </Link>
        </div>
      )}

      {booking && (
        <>
          {booking.status === 1 ? (
            <p className="mb-6 text-center text-lg font-bold text-court-700">تم تأكيد حجزك بنجاح 🎾</p>
          ) : (
            <p className="mb-6 text-center text-lg font-bold text-red-600">
              لم يتم تأكيد الدفع. تم تحرير الأوقات المحجوزة، يمكنك المحاولة مرة أخرى.
            </p>
          )}
          <BookingTicket booking={booking} />
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-court-700 underline">
              العودة للرئيسية
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

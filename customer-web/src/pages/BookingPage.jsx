import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingTicket from "../components/BookingTicket";
import { getBookingByReference } from "../api/bookings";
import { extractApiError } from "../api/client";

export default function BookingPage() {
  const { reference } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBookingByReference(reference)
      .then(setBooking)
      .catch((err) => setError(extractApiError(err).message))
      .finally(() => setLoading(false));
  }, [reference]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {loading && <p className="text-center text-gray-400">جارٍ التحميل...</p>}
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

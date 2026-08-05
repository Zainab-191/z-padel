import { useEffect, useState } from "react";
import DateStrip from "../components/DateStrip";
import TimeSlotGrid from "../components/TimeSlotGrid";
import CartBar from "../components/CartBar";
import { getAvailability } from "../api/availability";
import { extractApiError } from "../api/client";
import { todayIso } from "../utils/format";

export default function HomePage() {
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAvailability(date)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28">
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h1 className="mb-1 text-xl font-extrabold text-court-900">احجز ملعبك</h1>
        <p className="mb-4 text-sm text-gray-500">اختر التاريخ والوقت المناسب — بدون تسجيل حساب</p>
        <DateStrip value={date} onChange={setDate} />
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-bold text-court-900">الأوقات المتاحة</h2>
        <TimeSlotGrid date={date} slots={slots} loading={loading} error={error} />
        <p className="mt-4 text-xs text-gray-400">
          * السعر المعروض تقديري لساعة واحدة. عند اختيار ساعتين فأكثر قد يقل السعر تلقائياً حسب العروض المتدرجة.
        </p>
      </div>

      <CartBar />
    </div>
  );
}

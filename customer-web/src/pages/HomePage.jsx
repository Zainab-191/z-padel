import { useEffect, useState } from "react";
import DateStrip from "../components/DateStrip";
import TimeSlotGrid from "../components/TimeSlotGrid";
import CartBar from "../components/CartBar";
import { getAvailability } from "../api/availability";
import { extractApiError } from "../api/client";
import { todayIso } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";
import heroImg from "../assets/padel-night-court.jpg";

export default function HomePage() {
  const { t } = useLanguage();
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
      <section className="mb-4 overflow-hidden rounded-2xl bg-court-900">
        <div className="relative h-44 sm:h-56">
          <img
            src={heroImg}
            alt=""
            width="1200"
            height="1200"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[50%_88%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h1 className="text-[28px] font-semibold text-white sm:text-4xl">{t("home.title")}</h1>
            <p className="mt-1 text-sm text-white/85">{t("home.subtitle")}</p>
          </div>
        </div>
      </section>

      <div className="mb-4 rounded-2xl bg-white p-5">
        <DateStrip value={date} onChange={setDate} />
      </div>

      <div className="rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-court-900">{t("home.availableTimes")}</h2>
        <TimeSlotGrid date={date} slots={slots} loading={loading} error={error} />
        <p className="mt-4 text-xs text-gray-600">{t("home.priceNote")}</p>
      </div>

      <CartBar />
    </div>
  );
}

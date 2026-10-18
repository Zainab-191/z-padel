import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createBooking, initiateThawaniPayment, quoteBooking } from "../api/bookings";
import { extractApiError } from "../api/client";
import { formatDateShort, formatOMR, formatTime } from "../utils/format";
import { useLanguage } from "../i18n/LanguageContext";

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export default function CheckoutPage() {
  const { items, removeSlot, clear } = useCart();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(null);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    setQuoteLoading(true);
    setQuoteError(null);
    quoteBooking(items.map((s) => ({ date: s.date, startTime: s.startTime })))
      .then(setQuote)
      .catch((err) => setQuoteError(extractApiError(err).message))
      .finally(() => setQuoteLoading(false));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-gray-600">{t("checkout.noSlotsYet")}</p>
        <button onClick={() => navigate("/")} className="min-h-12 rounded-full bg-court-600 px-7 font-semibold text-white transition hover:bg-court-500">
          {t("checkout.backToBooking")}
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!PHONE_REGEX.test(phone.trim())) {
      setFormError(t("checkout.invalidPhone"));
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBooking({
        guestPhone: phone.trim(),
        guestName: name.trim() || null,
        guestEmail: email.trim() || null,
        paymentMethod,
        slots: items.map((s) => ({ date: s.date, startTime: s.startTime })),
      });

      if (paymentMethod === 1) {
        const { checkoutUrl } = await initiateThawaniPayment(booking.reference);
        clear();
        window.location.href = checkoutUrl;
        return;
      }

      clear();
      navigate(`/booking/${booking.reference}`);
    } catch (err) {
      const { message, details } = extractApiError(err);
      if (details?.unavailableSlots?.length) {
        setFormError(
          t("checkout.unavailableSlots", {
            list: details.unavailableSlots.map((s) => `${s.date} ${s.startTime}`).join("، "),
          }),
        );
      } else {
        setFormError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const total = quote?.estimatedTotal ?? items.reduce((s, i) => s + Number(i.estimatedPricePerHour), 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <h1 className="mb-4 text-2xl font-semibold text-court-900">{t("checkout.title")}</h1>

      <div className="mb-6 rounded-2xl bg-white p-5">
        <h2 className="mb-3 text-base font-semibold text-court-900">{t("checkout.summary")}</h2>
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={`${s.date}_${s.startTime}`} className="flex min-h-11 items-center justify-between text-sm">
              <span>
                {formatDateShort(s.date, language)} · {formatTime(s.startTime, language)}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-600">{formatOMR(s.estimatedPricePerHour, language)}</span>
                <button
                  type="button"
                  onClick={() => removeSlot(s.date, s.startTime)}
                  className="grid h-11 w-11 place-items-center rounded-full text-red-600 transition hover:bg-red-50"
                  aria-label={t("checkout.remove")}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-court-200 pt-3">
          <span className="text-sm font-medium text-gray-600">
            {t("checkout.total")} {quoteLoading && t("checkout.updating")}
          </span>
          <span className="text-lg font-semibold text-court-900">{formatOMR(total, language)}</span>
        </div>
        {quoteError && <p role="alert" className="mt-2 text-xs text-red-700">{quoteError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5">
        <h2 className="text-base font-semibold text-court-900">{t("checkout.yourInfo")}</h2>

        <div>
          <label htmlFor="guest-phone" className="mb-1.5 block text-sm font-medium text-court-900">
            {t("checkout.phone")} <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="guest-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-invalid={formError === t("checkout.invalidPhone")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+968XXXXXXXX"
            className="w-full min-h-12 rounded-xl border border-court-200 bg-white px-4 text-base focus:border-court-600"
            dir="ltr"
          />
        </div>

        <div>
          <label htmlFor="guest-name" className="mb-1.5 block text-sm font-medium text-court-900">{t("checkout.name")}</label>
          <input
            id="guest-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-court-200 bg-white px-4 text-base focus:border-court-600"
          />
        </div>

        <div>
          <label htmlFor="guest-email" className="mb-1.5 block text-sm font-medium text-court-900">{t("checkout.email")}</label>
          <input
            id="guest-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-court-200 bg-white px-4 text-base focus:border-court-600"
            dir="ltr"
          />
        </div>

        <div>
          <span id="pay-label" className="mb-2 block text-sm font-medium text-court-900">{t("checkout.paymentMethod")}</span>
          <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="pay-label">
            <button
              type="button"
              onClick={() => setPaymentMethod(0)}
              aria-pressed={paymentMethod === 0}
              className={`min-h-14 rounded-xl border px-4 text-sm font-medium transition ${
                paymentMethod === 0 ? "border-court-600 bg-court-600 text-white" : "border-court-200 bg-white text-court-900 hover:border-court-400"
              }`}
            >
              {t("checkout.payOnArrival")}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod(1)}
              aria-pressed={paymentMethod === 1}
              className={`min-h-14 rounded-xl border px-4 text-sm font-medium transition ${
                paymentMethod === 1 ? "border-court-600 bg-court-600 text-white" : "border-court-200 bg-white text-court-900 hover:border-court-400"
              }`}
            >
              {t("checkout.payThawani")}
            </button>
          </div>
        </div>

        {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 w-full rounded-full bg-ball-500 font-semibold transition hover:bg-ball-600 active:scale-[0.99] disabled:opacity-50"
        >
          {submitting ? t("checkout.submitting") : `${t("checkout.confirmButton")} — ${formatOMR(total, language)}`}
        </button>
      </form>
    </div>
  );
}

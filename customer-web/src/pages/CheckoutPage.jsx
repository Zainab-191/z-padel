import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createBooking, initiateThawaniPayment, quoteBooking } from "../api/bookings";
import { extractApiError } from "../api/client";
import { formatDateShort, formatOMR, formatTime } from "../utils/format";

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export default function CheckoutPage() {
  const { items, removeSlot, clear } = useCart();
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
        <p className="mb-4 text-gray-500">لم تقم باختيار أي وقت بعد.</p>
        <button onClick={() => navigate("/")} className="rounded-full bg-court-600 px-6 py-2 font-bold text-white">
          العودة للحجز
        </button>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!PHONE_REGEX.test(phone.trim())) {
      setFormError("رقم الهاتف غير صحيح. أدخل 7 إلى 15 رقماً، يمكن أن يبدأ بـ +");
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
          `بعض الأوقات لم تعد متاحة (${details.unavailableSlots
            .map((s) => `${s.date} ${s.startTime}`)
            .join("، ")}). الرجاء العودة واختيار أوقات أخرى.`,
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
      <h1 className="mb-4 text-xl font-extrabold text-court-900">إتمام الحجز</h1>

      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-sm font-bold text-court-900">ملخص الحجز</h2>
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={`${s.date}_${s.startTime}`} className="flex items-center justify-between text-sm">
              <span>
                {formatDateShort(s.date)} · {formatTime(s.startTime)}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-500">{formatOMR(s.estimatedPricePerHour)}</span>
                <button
                  type="button"
                  onClick={() => removeSlot(s.date, s.startTime)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="إزالة"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
          <span className="text-sm font-medium text-gray-600">الإجمالي {quoteLoading && "(جارٍ التحديث...)"}</span>
          <span className="text-lg font-extrabold text-court-900">{formatOMR(total)}</span>
        </div>
        {quoteError && <p className="mt-2 text-xs text-red-600">{quoteError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h2 className="text-sm font-bold text-court-900">بياناتك</h2>

        <div>
          <label className="mb-1 block text-sm text-gray-600">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+968XXXXXXXX"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-court-500 focus:outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">الاسم (اختياري)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-court-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">البريد الإلكتروني (اختياري)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-court-500 focus:outline-none"
            dir="ltr"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-600">طريقة الدفع</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod(0)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                paymentMethod === 0 ? "border-court-600 bg-court-50 text-court-900" : "border-gray-200 text-gray-500"
              }`}
            >
              الدفع عند الوصول
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod(1)}
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                paymentMethod === 1 ? "border-court-600 bg-court-50 text-court-900" : "border-gray-200 text-gray-500"
              }`}
            >
              دفع إلكتروني (ثواني)
            </button>
          </div>
        </div>

        {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ball-500 py-3 font-bold text-court-900 shadow-md transition hover:bg-ball-600 disabled:opacity-50"
        >
          {submitting ? "جارٍ التأكيد..." : `تأكيد الحجز — ${formatOMR(total)}`}
        </button>
      </form>
    </div>
  );
}

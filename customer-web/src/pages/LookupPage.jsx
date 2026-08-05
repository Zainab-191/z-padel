import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LookupPage() {
  const [reference, setReference] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (reference.trim()) navigate(`/booking/${reference.trim().toUpperCase()}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-xl font-extrabold text-court-900">تتبع حجزك</h1>
      <p className="mb-6 text-center text-sm text-gray-500">أدخل رقم الحجز الذي استلمته بعد إتمام الحجز</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="ZP-XXXXXX"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center font-mono focus:border-court-500 focus:outline-none"
          dir="ltr"
        />
        <button type="submit" className="rounded-lg bg-court-600 px-5 py-2 font-bold text-white">
          بحث
        </button>
      </form>
    </div>
  );
}

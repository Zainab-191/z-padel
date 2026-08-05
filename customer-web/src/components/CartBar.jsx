import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatOMR } from "../utils/format";

export default function CartBar() {
  const { items, estimatedTotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-court-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-sm text-gray-500">
            {items.length} {items.length === 1 ? "ساعة محددة" : "ساعات محددة"}
          </p>
          <p className="text-lg font-extrabold text-court-900">{formatOMR(estimatedTotal)}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="rounded-full bg-ball-500 px-6 py-3 font-bold text-court-900 shadow-md transition hover:bg-ball-600"
        >
          متابعة الحجز
        </button>
      </div>
    </div>
  );
}

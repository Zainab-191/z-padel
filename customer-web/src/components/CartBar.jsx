import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../i18n/LanguageContext";
import { formatOMR } from "../utils/format";

export default function CartBar() {
  const { items, estimatedTotal } = useCart();
  const { t, tPlural, language } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <div className="cart-bar fixed inset-x-0 bottom-0 z-20 border-t border-court-200 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div aria-live="polite">
          <p className="text-sm text-gray-600">
            {items.length} {tPlural("cart.hourSelected", items.length)}
          </p>
          <p className="text-lg font-semibold text-court-900">{formatOMR(estimatedTotal, language)}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="min-h-12 rounded-full bg-ball-500 px-7 font-semibold transition hover:bg-ball-600 active:scale-[0.98]"
        >
          {t("cart.continueButton")}
        </button>
      </div>
    </div>
  );
}

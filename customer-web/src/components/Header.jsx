import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-court-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
        <Link to="/" className="flex min-h-11 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-court-900 text-lg font-bold text-white"
          >
            Z
          </span>
          <span className="text-lg font-semibold text-court-900">{t("header.brand")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/lookup"
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-court-600 transition hover:bg-court-100"
          >
            {t("header.myBookings")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

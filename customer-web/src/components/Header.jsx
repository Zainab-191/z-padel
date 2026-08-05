import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="court-lines-bg text-white shadow-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ball-500 text-court-900 font-black text-lg">
            Z
          </span>
          <span className="text-xl font-extrabold tracking-tight">{t("header.brand")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/lookup"
            className="rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            {t("header.myBookings")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

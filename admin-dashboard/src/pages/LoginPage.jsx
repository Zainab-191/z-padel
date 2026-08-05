import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractApiError } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-court-900 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-ball-500 text-court-900 font-black text-xl">
            Z
          </span>
          <h1 className="text-lg font-extrabold text-court-900">{t("login.title")}</h1>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-600">{t("login.username")}</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-court-500 focus:outline-none"
            dir="ltr"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-600">{t("login.password")}</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-court-500 focus:outline-none"
            dir="ltr"
          />
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-court-600 py-2.5 font-bold text-white transition hover:bg-court-700 disabled:opacity-50"
        >
          {submitting ? t("login.submitting") : t("login.submit")}
        </button>

        <div className="mt-4 text-center">
          <LanguageSwitcher className="!text-court-600" />
        </div>
      </form>
    </div>
  );
}

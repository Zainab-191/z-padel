import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getNested, translations } from "./translations";

const STORAGE_KEY = "zpadel_lang";
const RTL_LANGS = new Set(["ar"]);

export function getStoredLanguage() {
  return localStorage.getItem(STORAGE_KEY) || "ar";
}

/** Non-hook helper for plain JS modules (e.g. the axios client) that can't use useLanguage(). */
export function tPlain(key) {
  const lang = getStoredLanguage();
  return getNested(translations[lang], key) ?? key;
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);

  const dir = RTL_LANGS.has(language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }

  function t(key, params) {
    let value = getNested(translations[language], key);
    if (value === undefined) return key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replaceAll(`{{${k}}}`, v);
      }
    }
    return value;
  }

  /** Picks the correct plural form for count-dependent strings, e.g. t.plural('cart.hourSelected', count). */
  function tPlural(baseKey, count) {
    const suffix = count === 1 ? "_one" : "_other";
    return t(`${baseKey}${suffix}`);
  }

  const dict = translations[language];

  const value = useMemo(
    () => ({ language, setLanguage, dir, t, tPlural, dict }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, dir],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

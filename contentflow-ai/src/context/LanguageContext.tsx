"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { es } from "@/lib/translations/es";
import { en } from "@/lib/translations/en";

type Locale = "es" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en"); // Default to English for global reach

  useEffect(() => {
    // Run client-side check
    const savedLocale = localStorage.getItem("cf_locale") as Locale;
    if (savedLocale === "es" || savedLocale === "en") {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLang = navigator.language || (navigator as any).userLanguage || "";
      if (browserLang.toLowerCase().startsWith("es")) {
        setLocaleState("es");
      } else {
        setLocaleState("en");
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("cf_locale", newLocale);
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = (key: string, replacements?: Record<string, string>): any => {
    const dictionary = locale === "es" ? es : en;
    const value = (dictionary as any)[key] || (en as any)[key] || key;

    if (typeof value === "string" && replacements) {
      let result = value;
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, "g"), v);
      });
      return result;
    }

    return value;
  };

  // Prevent flash of untranslated content (optional - but good for UX)
  // If not mounted yet, render with default but don't block
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

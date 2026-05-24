"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import vi from "@/locales/vi";
import en from "@/locales/en";

type Lang = "vi" | "en";
type Translations = typeof vi | typeof en;

interface LangContextType {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("vi");

  const toggleLang = () => setLang((prev) => (prev === "vi" ? "en" : "vi"));

  const t = lang === "vi" ? vi : en;

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

// Custom hook để dùng ở bất kỳ component nào
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang phải dùng trong LangProvider");
  return ctx;
}
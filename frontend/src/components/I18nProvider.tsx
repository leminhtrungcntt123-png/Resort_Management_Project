"use client";

import { useEffect } from "react";
import i18n from "@/i18n";

type I18nProviderProps = {
  children: React.ReactNode;
};

export default function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const updateLangAttr = (lng: string) => {
      document.documentElement.lang = lng;
    };

    updateLangAttr(i18n.language);
    i18n.on("languageChanged", updateLangAttr);

    return () => {
      i18n.off("languageChanged", updateLangAttr);
    };
  }, []);

  return <>{children}</>;
}

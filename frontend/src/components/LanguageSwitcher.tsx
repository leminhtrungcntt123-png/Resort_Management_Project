"use client";

import { useTranslation } from "react-i18next";
import "@/i18n";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "en";

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1">
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition ${
          currentLanguage.startsWith("en")
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        {t("language.english")}
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("vi")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition ${
          currentLanguage.startsWith("vi")
            ? "bg-zinc-900 text-white"
            : "text-zinc-700 hover:bg-zinc-100"
        }`}
      >
        {t("language.vietnamese")}
      </button>
    </div>
  );
}

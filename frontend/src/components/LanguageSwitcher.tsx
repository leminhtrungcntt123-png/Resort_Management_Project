"use client";

import { useLang } from "@/contexts/LangContext";

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1">
      {(["vi", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => lang !== l && toggleLang()}
          className={`rounded-md px-3 py-1 text-sm font-medium transition ${
            lang === l
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
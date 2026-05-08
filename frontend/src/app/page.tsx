"use client";

import { useTranslation } from "react-i18next";
import "@/i18n";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="text-3xl font-semibold text-zinc-900">{t("home.title")}</h2>
        <p className="mt-3 max-w-2xl text-zinc-600">{t("home.subtitle")}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">{t("dashboard.rooms")}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">128</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">{t("dashboard.bookings")}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">53</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">{t("dashboard.customers")}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">211</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4">
            <p className="text-sm text-zinc-500">{t("dashboard.revenue")}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">$12,450</p>
          </div>
        </div>
      </section>
    </main>
  );
}

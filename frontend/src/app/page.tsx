"use client";

import { useLang } from "@/contexts/LangContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

interface DashboardStats {
    totalRooms:     number;
    totalBookings:  number;
    totalCustomers: number;
    monthlyRevenue: number;
}

export default function Home() {
    const { t } = useLang();
    const [stats, setStats]     = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [rooms, bookings, customers, revenue] = await Promise.all([
                    api.get("/api/rooms"),
                    api.get("/api/bookings"),
                    api.get("/api/customers"),
                    api.get("/api/payments/revenue?period=month"),
                ]);

                console.log("rooms:", rooms);
                console.log("bookings:", bookings);
                console.log("revenue:", revenue);

                setStats({
                    totalRooms:     rooms.data.totalElements,
                    totalBookings:  Array.isArray(bookings) 
                        ? bookings.length 
                        : bookings.data.totalElements,
                        totalCustomers: customers.data.totalElements,
                        monthlyRevenue: Array.isArray(revenue)
                        ? revenue.reduce((sum: number, item: { revenue: number }) =>
                            sum + item.revenue, 0)
                        : 0,
            });
            } catch (err) {
                console.error("Lỗi fetch dashboard:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    const cards = [
        { label: t.dashboard.rooms,     value: stats?.totalRooms },
        { label: t.dashboard.bookings,  value: stats?.totalBookings },
        { label: t.dashboard.customers, value: stats?.totalCustomers },
        { label: t.dashboard.revenue,
          value: stats?.monthlyRevenue
            ? `${stats.monthlyRevenue.toLocaleString("vi-VN")}đ`
            : undefined
        },
    ];

    return (
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16">
            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="text-3xl font-semibold text-zinc-900">
                    {t.home.title}
                </h2>
                <p className="mt-3 max-w-2xl text-zinc-600">
                    {t.home.subtitle}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.label}
                            className="rounded-xl border border-zinc-200 p-4">
                            <p className="text-sm text-zinc-500">{card.label}</p>
                            <p className="mt-2 text-2xl font-semibold text-zinc-900">
                                {loading ? "..." : (card.value ?? "—")}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
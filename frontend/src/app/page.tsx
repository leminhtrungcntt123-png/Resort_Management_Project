"use client";

import { useLang } from "@/contexts/LangContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
// Import bộ icon từ lucide-react (đã được cài sẵn khi bạn cài shadcn ui)
import { Bed, CalendarDays, Users, DollarSign, ArrowUpRight } from "lucide-react";

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

                setStats({
                    totalRooms:     rooms.data.totalElements,
                    totalBookings:  Array.isArray(bookings)
                        ? bookings.length
                        : bookings.data.totalElements,
                    totalCustomers: customers.data.totalElements,
                    monthlyRevenue: Array.isArray(revenue)
                        ? revenue.reduce((sum: number, item: { revenue: number }) => sum + item.revenue, 0)
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

    // Định nghĩa cấu trúc card kèm Icon và Màu sắc cao cấp đại diện
    const cards = [
        {
            label: t.dashboard.rooms,
            value: stats?.totalRooms,
            icon: Bed,
            color: "text-blue-600 bg-blue-50 border-blue-100"
        },
        {
            label: t.dashboard.bookings,
            value: stats?.totalBookings,
            icon: CalendarDays,
            color: "text-amber-600 bg-amber-50 border-amber-100"
        },
        {
            label: t.dashboard.customers,
            value: stats?.totalCustomers,
            icon: Users,
            color: "text-purple-600 bg-purple-50 border-purple-100"
        },
        {
            label: t.dashboard.revenue,
            value: stats?.monthlyRevenue ? `${stats.monthlyRevenue.toLocaleString("vi-VN")}đ` : undefined,
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* LỜI CHÀO ĐẦU TRANG */}
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                    {t.home.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                    {t.home.subtitle}
                </p>
            </div>

            {/* GRID THỐNG KÊ (CARDS) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    {card.label}
                                </p>
                                {/* Icon bọc trong một cái box màu nhẹ nhàng */}
                                <div className={`rounded-xl border p-2 ${card.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-4 flex items-baseline justify-between">
                                {loading ? (
                                    /* Khung xương giả (Skeleton) nhấp nháy khi loading nhìn rất chuyên nghiệp */
                                    <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
                                ) : (
                                    <p className="text-3xl font-bold tracking-tight text-zinc-950">
                                        {card.value ?? "—"}
                                    </p>
                                )}

                                <span className="text-xs font-medium text-zinc-400 flex items-center gap-0.5">
                                    Tháng này <ArrowUpRight className="h-3 w-3" />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* KHU VỰC TRỐNG CHỜ LÀM BIỂU ĐỒ HOẶC DANH SÁCH PHÒNG ĐẶT GẦN ĐÂY */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm min-h-[300px] flex items-center justify-center text-zinc-400 text-sm border-dashed">
                    [Khu vực tích hợp Biểu đồ Doanh thu / Thống kê mật độ phòng]
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm min-h-[300px] flex items-center justify-center text-zinc-400 text-sm border-dashed">
                    [Khu vực Đơn đặt phòng mới nhất]
                </div>
            </div>
        </div>
    );
}
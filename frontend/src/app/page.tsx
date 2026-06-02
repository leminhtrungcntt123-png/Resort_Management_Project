"use client";

import { useLang } from "@/contexts/LangContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Bed, CalendarDays, Users, DollarSign, ArrowUpRight, Target, LayoutDashboard, DoorOpen, Info, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Label } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DashboardStats {
    totalRooms:     number;
    totalBookings:  number;
    totalCustomers: number;
    monthlyRevenue: number;
}

interface RoomTypeStat {
    type: string;
    bookings: number;
    fill: string;
}

interface MonthlyStat {
    month: string;
    bookings: number;
}

// 🎯 ĐỊNH NGHĨA THEO ĐÚNG CHUẨN CẤU TRÚC FILE SQL CỦA BẠN
interface RoomData {
    id: number;
    room_number: string; // Khớp chuẩn cột room_number trong SQL
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | string; // Khớp Enum trong SQL
    floor_number?: number; // Cột floor_number
    roomType?: {           // Liên kết sang bảng room_types
        type_name: string; // Cột type_name
        price_per_night?: number; // Cột price_per_night
    };
    // Dữ liệu giả lập nối thêm từ bảng bookings/persons nếu có khách ở
    currentBooking?: {
        customerName: string;
        checkIn: string;
        checkOut: string;
    };
}

const chartConfig = {
  bookings: { label: "Lượt đặt" }
};

export default function Home() {
    const { lang, t } = useLang();
    const [stats, setStats]     = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const [roomTypeData, setRoomTypeData] = useState<RoomTypeStat[]>([]);
    const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyStat[]>([]);

    const [roomsList, setRoomsList] = useState<RoomData[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    const totalBookingsCount = roomTypeData.reduce((acc, curr) => acc + curr.bookings, 0);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [roomsRes, bookingsRes, customersRes, revenueRes] = await Promise.all([
                    api.get("/api/rooms"),
                    api.get("/api/bookings"),
                    api.get("/api/customers"),
                    api.get("/api/payments/revenue?period=month"),
                ]);

                // Hỗ trợ bóc tách nếu backend bọc dữ liệu trong mảng 'content' của Pageable Spring Boot
                const allRooms = roomsRes.data?.content || roomsRes.data || [];
                const allBookings = bookingsRes.data?.content || bookingsRes.data || [];

                setRoomsList(allRooms);

                setStats({
                    totalRooms:     roomsRes.data?.totalElements || allRooms.length,
                    totalBookings:  bookingsRes.data?.totalElements || allBookings.length,
                    totalCustomers: customersRes.data?.totalElements || 0,
                    monthlyRevenue: Array.isArray(revenueRes.data)
                        ? revenueRes.data.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0)
                        : (revenueRes.data?.revenue || 0),
                });

                const luxuryColors = [
                    "oklch(0.60 0.16 250)", "oklch(0.67 0.13 210)", "oklch(0.55 0.17 190)",
                    "oklch(0.72 0.11 150)", "oklch(0.60 0.15 320)", "oklch(0.65 0.18 10)",
                    "oklch(0.75 0.14 45)",  "oklch(0.78 0.12 80)",  "oklch(0.48 0.13 110)", "oklch(0.40 0.15 280)"
                ];

                // THUẬT TOÁN LOẠI PHÒNG (Ăn theo đúng trường type_name trong SQL)
                const typeCounter: Record<string, number> = {};
                allBookings.forEach((booking: any) => {
                    const typeName = booking.room?.roomType?.type_name || booking.roomType || "Standard City View";
                    typeCounter[typeName] = (typeCounter[typeName] || 0) + 1;
                });

                const computedRoomTypes = Object.keys(typeCounter).map((key, index) => ({
                    type: key,
                    bookings: typeCounter[key],
                    fill: luxuryColors[index % luxuryColors.length]
                }));
                setRoomTypeData(computedRoomTypes);

                // THUẬT TOÁN THEO THÁNG
                const monthCounter: Record<string, number> = {};
                allBookings.forEach((booking: any) => {
                    const dateStr = booking.createdAt || booking.bookingDate || booking.checkInDate || booking.check_in_date;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            const monthKey = `${date.getMonth() + 1}`;
                            monthCounter[monthKey] = (monthCounter[monthKey] || 0) + 1;
                        }
                    }
                });

                const sortedMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
                const computedMonthlyData = sortedMonths
                    .filter(m => monthCounter[m] !== undefined || Object.keys(monthCounter).length === 0)
                    .map(m => ({
                        month: `${t.charts?.monthPrefix || (lang === "vi" ? "Tháng" : "Month")} ${m}`,
                        bookings: monthCounter[m] || 0
                    }));

                setMonthlyBookingData(computedMonthlyData.length > 0 ? computedMonthlyData : sortedMonths.slice(0, 6).map(m => ({ month: `${t.charts?.monthPrefix || (lang === "vi" ? "Tháng" : "Month")} ${m}`, bookings: 0 })));

            } catch (err) {
                console.error("Lỗi đồng bộ dữ liệu tổng quan:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [lang]);

    const cards = [
        { label: t.dashboard.rooms, value: stats?.totalRooms, icon: Bed, color: "text-blue-600 bg-blue-50 border-blue-100" },
        { label: t.dashboard.bookings, value: stats?.totalBookings, icon: CalendarDays, color: "text-amber-600 bg-amber-50 border-amber-100" },
        { label: t.dashboard.customers, value: stats?.totalCustomers, icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
        { label: t.dashboard.revenue, value: stats?.monthlyRevenue ? `${stats.monthlyRevenue.toLocaleString("vi-VN")}đ` : undefined, icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    ];

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case "AVAILABLE":
                return "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 shadow-emerald-100/20";
            case "OCCUPIED":
                return "border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-700 shadow-rose-100/20";
            case "MAINTENANCE":
                return "border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-amber-700 shadow-amber-100/20";
            default:
                return "border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50 text-zinc-700";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{t.home.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{t.home.subtitle}</p>
            </div>

            {/* CARDS THỐNG KÊ */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{card.label}</p>
                                <div className={`rounded-xl border p-2 ${card.color}`}><Icon className="h-5 w-5" /></div>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                {loading ? (
                                    <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
                                ) : (
                                    <p className="text-3xl font-bold tracking-tight text-zinc-950">{card.value ?? "—"}</p>
                                )}
                                <span className="text-xs font-medium text-zinc-400 flex items-center gap-0.5">
                                    {t.charts?.thisMonth || (lang === "vi" ? "Tháng này" : "This month")} <ArrowUpRight className="h-3 w-3" />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* SƠ ĐỒ TRẠNG THÁI PHÒNG (ROOM GRID) */}
            <Card className="rounded-2xl shadow-sm border-zinc-200 overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-zinc-900 p-1.5 text-white">
                                <DoorOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-zinc-900">
                                    {lang === "vi" ? "Sơ đồ trạng thái phòng thời gian thực" : "Real-time Room Status Matrix"}
                                </CardTitle>
                                <CardDescription>
                                    {lang === "vi" ? "Click vào ô phòng bất kỳ để xem thông tin khách ở hoặc dịch vụ" : "Click on any room to inspect current guest occupancy details"}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {lang === "vi" ? "Trống" : "Available"}</div>
                            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> {lang === "vi" ? "Có khách" : "Occupied"}</div>
                            <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {lang === "vi" ? "Bảo trì" : "Maintenance"}</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="h-20 rounded-xl bg-zinc-100 animate-pulse" />
                            ))}
                        </div>
                    ) : roomsList.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 text-sm border border-dashed rounded-xl">
                            {lang === "vi" ? "Không tìm thấy danh sách phòng nào trong SQL Server." : "No room layouts discovered in SQL Server."}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {roomsList.map((room) => (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoom(room)}
                                    className={`group relative flex flex-col justify-between p-3.5 rounded-xl border-2 text-left transition-all duration-200 shadow-sm ${getStatusStyles(room.status)}`}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        {/* 🛠️ SỬA ĐỔI 1: room.room_number gọi chuẩn xác theo cột trong SQL */}
                                        <span className="text-lg font-extrabold tracking-tight">{room.room_number || `P.${room.id}`}</span>
                                        <Info className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                                    </div>
                                    <div className="mt-3 text-[10px] uppercase font-bold tracking-wider opacity-80 truncate">
                                        {/* 🛠️ SỬA ĐỔI 2: room.roomType.type_name gọi chuẩn xác theo bảng room_types */}
                                        {room.roomType?.type_name || (lang === "vi" ? "Chưa phân loại" : "Standard")}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* KHU VỰC BIỂU ĐỒ */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. BIỂU ĐỒ TRÒN */}
                <Card className="lg:col-span-2 rounded-2xl shadow-sm border-zinc-200 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-zinc-100 p-1.5 text-zinc-700"><Target className="h-4 w-4" /></div>
                            <CardTitle className="text-base font-semibold text-zinc-900">{t.charts?.pieTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.charts?.pieDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6 flex flex-col md:flex-row items-center justify-between gap-8 flex-1">
                        {loading ? (
                            <div className="h-[250px] w-full flex items-center justify-center text-sm text-zinc-400 animate-pulse">{t.charts?.loadingData}</div>
                        ) : roomTypeData.length === 0 ? (
                            <div className="h-[250px] w-full flex items-center justify-center text-sm text-zinc-400 border border-dashed rounded-xl p-4 text-center">{t.charts?.emptyData}</div>
                        ) : (
                            <>
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px] w-full md:w-[45%]">
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={roomTypeData} dataKey="bookings" nameKey="type" innerRadius={80} outerRadius={115} strokeWidth={4} stroke="#fff">
                                            {roomTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                            <Label
                                                value={totalBookingsCount}
                                                position="center"
                                                content={({ viewBox }) => {
                                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                        return (
                                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-zinc-950 text-4xl font-extrabold tracking-tight">{totalBookingsCount}</tspan>
                                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-zinc-400 text-xs font-semibold uppercase tracking-wider">{t.charts?.totalLabel}</tspan>
                                                            </text>
                                                        );
                                                    }
                                                }}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-medium text-zinc-600 w-full md:w-[55%] border-t border-zinc-100 pt-4 md:border-t-0 md:pt-0">
                                    {roomTypeData.map((item) => {
                                        const percentage = totalBookingsCount > 0 ? ((item.bookings / totalBookingsCount) * 100).toFixed(1) : "0.0";
                                        return (
                                            <div key={item.type} className="flex items-center justify-between border-b border-zinc-50 pb-1.5 px-1">
                                                <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                                                    <span className="h-3 w-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.fill }} />
                                                    <span className="truncate text-zinc-700 font-medium">{item.type}</span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-zinc-900 font-bold">{item.bookings}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-semibold">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* 2. BIỂU ĐỒ CỘT */}
                <Card className="rounded-2xl shadow-sm border-zinc-200 flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-zinc-100 p-1.5 text-zinc-700"><LayoutDashboard className="h-4 w-4" /></div>
                            <CardTitle className="text-base font-semibold text-zinc-900">{t.charts?.barTitle}</CardTitle>
                        </div>
                        <CardDescription>{t.charts?.barDesc}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:p-6 flex-1 flex items-center">
                        {loading ? (
                            <div className="h-[280px] w-full flex items-center justify-center text-sm text-zinc-400 animate-pulse">{t.charts?.loadingData}</div>
                        ) : (
                            <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                <BarChart data={monthlyBookingData}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs text-zinc-500" />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="bookings" fill="oklch(0.35 0.12 250)" radius={6} barSize={24} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                    <CardFooter className="text-xs text-zinc-400 border-t border-zinc-100 pt-4 pb-4">{t.charts?.footerPie}</CardFooter>
                </Card>
            </div>

            {/* POPUP CHI TIẾT PHÒNG */}
            <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
                <DialogContent className="sm:max-w-[440px] rounded-2xl border-zinc-200 bg-white p-6 shadow-xl">
                    <DialogHeader className="pb-4 border-b border-zinc-100">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-800 font-black text-lg">
                                {selectedRoom?.room_number}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-zinc-950">
                                    {lang === "vi" ? `Thông tin chi tiết phòng` : `Room Diagnostics`}
                                </DialogTitle>
                                <DialogDescription className="text-xs font-medium text-zinc-400 mt-0.5">
                                    {selectedRoom?.roomType?.type_name || "Standard Suite"}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-6 space-y-4 text-sm">
                        <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                            <span className="text-zinc-400 font-medium flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-zinc-400" /> Trạng thái</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                selectedRoom?.status?.toUpperCase() === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" :
                                selectedRoom?.status?.toUpperCase() === "OCCUPIED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                            }`}>
                                {selectedRoom?.status?.toUpperCase() === "AVAILABLE" ? (lang === "vi" ? "Sẵn sàng đón khách" : "Available") :
                                 selectedRoom?.status?.toUpperCase() === "OCCUPIED" ? (lang === "vi" ? "Đang có khách" : "Occupied") : (lang === "vi" ? "Đang sửa chữa" : "Under Maintenance")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-zinc-50 pb-2">
                            <span className="text-zinc-400 font-medium flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-zinc-400" /> Giá niêm yết</span>
                            <span className="text-zinc-900 font-bold">
                                {/* 🛠️ SỬA ĐỔI 3: Đổi roomType.price thành roomType.price_per_night khớp chuẩn bảng room_types */}
                                {selectedRoom?.roomType?.price_per_night ? `${selectedRoom.roomType.price_per_night.toLocaleString("vi-VN")}đ / đêm` : "600.000đ / đêm"}
                            </span>
                        </div>

                        {selectedRoom?.status?.toUpperCase() === "OCCUPIED" && (
                            <div className="mt-4 p-4 rounded-xl bg-zinc-50/50 border border-zinc-100 space-y-2.5">
                                <div className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                                    <User className="h-3 w-3" /> {lang === "vi" ? "Khách lưu trú hiện tại" : "Current Guest Record"}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-medium">{lang === "vi" ? "Tên khách" : "Guest Name"}</span>
                                    <span className="text-zinc-950 font-semibold">{selectedRoom.currentBooking?.customerName || "Nguyễn Văn Một"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-medium">{lang === "vi" ? "Ngày Check-in" : "Check-in Date"}</span>
                                    <span className="text-zinc-600 font-medium">{selectedRoom.currentBooking?.checkIn || "2026-05-11"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500 font-medium">{lang === "vi" ? "Ngày Check-out" : "Check-out Date"}</span>
                                    <span className="text-zinc-600 font-medium">{selectedRoom.currentBooking?.checkOut || "2026-05-15"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
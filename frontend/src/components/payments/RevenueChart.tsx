"use client";

import { RevenueItem } from "@/types/payment";

interface Props {
    data: RevenueItem[];
    period: string;
    onPeriodChange: (period: string) => void;
}

function formatPeriod(period: string, type: string): string {
    if (type === "month") return period;
    if (type === "year")  return period;
    const parts = period.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : period;
}

export default function RevenueChart({ data, period, onPeriodChange }: Props) {
    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    // Chỉ hiện 12 kỳ gần nhất
    const displayData = data.slice(-12);

    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">Doanh thu</h3>
                <div className="flex gap-2">
                    {["day", "month", "year"].map(p => (
                        <button
                            key={p}
                            onClick={() => onPeriodChange(p)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium border
                                ${period === p
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"}`}>
                            {p === "day" ? "Ngày" : p === "month" ? "Tháng" : "Năm"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bar chart */}
            {displayData.length === 0 ? (
                <p className="mt-8 text-center text-sm text-zinc-400">Chưa có dữ liệu</p>
            ) : (
                <div className="mt-4 flex items-end gap-2 h-48">
                    {displayData.map((item, i) => (
                        <div key={i} className="flex flex-1 flex-col items-center gap-1 group relative">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 hidden group-hover:block
                                bg-zinc-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                                {item.revenue.toLocaleString("vi-VN")}đ
                            </div>
                            <div
                                className="w-full rounded-t bg-zinc-900 hover:bg-zinc-700 transition-all min-h-[4px]"
                                style={{ height: `${Math.max((item.revenue / maxRevenue) * 100, 2)}%` }}
                            />
                            <p className="text-xs text-zinc-400 truncate w-full text-center">
                                {formatPeriod(item.period, period)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tổng */}
            <div className="mt-4 border-t border-zinc-100 pt-4 flex justify-between">
                <span className="text-sm text-zinc-500">
                    Tổng ({data.length} kỳ)
                </span>
                <span className="font-semibold">
                    {totalRevenue.toLocaleString("vi-VN")}đ
                </span>
            </div>
        </div>
    );
}
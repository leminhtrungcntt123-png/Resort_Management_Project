"use client";

import { RevenueItem } from "@/types/payment";
import { useLang } from "@/contexts/LangContext";

interface Props {
  data: RevenueItem[];
  period: string;
  onPeriodChange: (period: string) => void;
}

function formatPeriod(period: string, type: string): string {
  if (type === "month") return period;
  if (type === "year") return period;
  const parts = period.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : period;
}

export default function RevenueChart({ data, period, onPeriodChange }: Props) {
  const { t, lang } = useLang();

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  // Chỉ hiện 12 kỳ gần nhất
  const displayData = data.slice(-12);

  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900">
          {t?.chart?.title || "Doanh thu"}
        </h3>
        <div className="flex gap-2">
          {["day", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`rounded-lg px-3 py-1 text-xs font-medium border
                                ${
                                  period === p
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                                }`}
            >
              {p === "day"
                ? (t?.chart?.day || "Ngày")
                : p === "month"
                  ? (t?.chart?.month || "Tháng")
                  : (t?.chart?.year || "Năm")}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      {displayData.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-400">
          {t?.chart?.empty || "Chưa có dữ liệu"}
        </p>
      ) : (
        <div className="mt-4 flex items-end gap-2" style={{ height: "192px" }}>
          {displayData.map((item, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-1 group relative"
              style={{ height: "100%" }}
            >
              {/* Spacer đẩy bar xuống đáy */}
              <div style={{ flex: 1 }} />
              {/* Tooltip */}
              <div
                className="absolute top-0 hidden group-hover:block
                    bg-zinc-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10"
              >
                {lang === "en" ? `${item.revenue.toLocaleString("en-US")} VND` : `${item.revenue.toLocaleString("vi-VN")}đ`}
              </div>
              {/* Bar */}
              <div
                className="w-full rounded-t bg-zinc-900 hover:bg-zinc-700 transition-all"
                style={{
                  height: `${Math.max((item.revenue / maxRevenue) * 160, 4)}px`,
                }}
              />
              {/* Label */}
              <p className="text-xs text-zinc-400 truncate w-full text-center mt-1">
                {formatPeriod(item.period, period)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tổng */}
      <div className="mt-4 border-t border-zinc-100 pt-4 flex justify-between">
        <span className="text-sm text-zinc-500">
          {lang === "en" ? `Total (${data.length} periods)` : `Tổng (${data.length} kỳ)`}
        </span>
        <span className="font-semibold">
          {lang === "en" ? `${totalRevenue.toLocaleString("en-US")} VND` : `${totalRevenue.toLocaleString("vi-VN")}đ`}
        </span>
      </div>
    </div>
  );
}
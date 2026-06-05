"use client";

import { useLang } from "@/contexts/LangContext"; // Import hook ngôn ngữ

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];

const COLORS: Record<string, string> = {
    ALL:          "",
    PENDING:      "bg-yellow-100 text-yellow-700 border-yellow-200",
    CONFIRMED:    "bg-blue-100 text-blue-700 border-blue-200",
    CHECKED_IN:   "bg-green-100 text-green-700 border-green-200",
    CHECKED_OUT:  "bg-zinc-100 text-zinc-600 border-zinc-200",
    CANCELLED:    "bg-red-100 text-red-700 border-red-200",
};

interface Props {
    status: string;
    onChange: (status: string) => void;
}

export default function BookingFilter({ status, onChange }: Props) {
    const { t } = useLang(); // Lấy đối tượng dịch t

    // Định nghĩa object nhãn động lấy từ file locale
    const LABELS: Record<string, string> = {
        ALL:          t?.bookings?.filter?.all || "Tất cả",
        PENDING:      t?.bookings?.filter?.pending || "Chờ xác nhận",
        CONFIRMED:    t?.bookings?.filter?.confirmed || "Đã xác nhận",
        CHECKED_IN:   t?.bookings?.filter?.checkedIn || "Đang ở",
        CHECKED_OUT:  t?.bookings?.filter?.checkedOut || "Đã trả phòng",
        CANCELLED:    t?.bookings?.filter?.cancelled || "Đã hủy",
    };

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {STATUSES.map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`rounded-full px-4 py-1 text-sm font-medium border
                        ${status === s
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : COLORS[s] || "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        }`}>
                    {LABELS[s]}
                </button>
            ))}
        </div>
    );
}
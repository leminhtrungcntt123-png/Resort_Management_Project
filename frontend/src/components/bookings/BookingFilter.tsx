"use client";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];

const LABELS: Record<string, string> = {
    ALL:          "Tất cả",
    PENDING:      "Chờ xác nhận",
    CONFIRMED:    "Đã xác nhận",
    CHECKED_IN:   "Đang ở",
    CHECKED_OUT:  "Đã trả phòng",
    CANCELLED:    "Đã hủy",
};

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
"use client";

interface Props {
    status: string;
    floor: number | null;
    floors: number[];
    onStatusChange: (status: string) => void;
    onFloorChange: (floor: number | null) => void;
}

const STATUSES = ["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"];
const LABELS: Record<string, string> = {
    ALL:         "Tất cả",
    AVAILABLE:   "Còn trống",
    OCCUPIED:    "Đang ở",
    MAINTENANCE: "Bảo trì",
};

export default function RoomFilter({ status, floor, floors, onStatusChange, onFloorChange }: Props) {
    return (
        <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Filter status */}
            <div className="flex gap-2">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        onClick={() => onStatusChange(s)}
                        className={`rounded-full px-4 py-1 text-sm font-medium border
                            ${status === s
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            }`}>
                        {LABELS[s]}
                    </button>
                ))}
            </div>

            {/* Filter tầng */}
            <select
                value={floor ?? ""}
                onChange={e => onFloorChange(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm outline-none focus:border-zinc-400">
                <option value="">Tất cả tầng</option>
                {floors.map(f => (
                    <option key={f} value={f}>Tầng {f}</option>
                ))}
            </select>
        </div>
    );
}
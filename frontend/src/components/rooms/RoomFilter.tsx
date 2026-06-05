"use client";

import { useLang } from "@/contexts/LangContext";

interface Props {
    status: string;
    floor: number | null;
    floors: number[];
    onStatusChange: (status: string) => void;
    onFloorChange: (floor: number | null) => void;
}

const STATUSES = ["ALL", "AVAILABLE", "OCCUPIED", "MAINTENANCE"];

export default function RoomFilter({ status, floor, floors, onStatusChange, onFloorChange }: Props) {
    const { t } = useLang();

    const LABELS: Record<string, string> = {
        ALL:         t?.rooms?.filter?.all || "Tất cả phòng",
        AVAILABLE:   t?.rooms?.filter?.available || "Còn trống",
        OCCUPIED:    t?.rooms?.filter?.occupied || "Đang ở",
        MAINTENANCE: t?.rooms?.filter?.maintenance || "Bảo trì",
    };

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
                className="rounded-lg border border-zinc-200 px-3 py-1 text-sm outline-none focus:border-zinc-400 bg-white text-zinc-700">
                <option value="">{t?.rooms?.allFloors || "Tất cả tầng"}</option>
                {floors.map(f => (
                    <option key={f} value={f}>
                        {(t?.rooms?.floorPrefix || "Tầng") + ` ${f}`}
                    </option>
                ))}
            </select>
        </div>
    );
}
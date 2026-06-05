"use client";

import { useLang } from "@/contexts/LangContext"; // Import hook ngôn ngữ

interface Props {
    page: number;
    totalPages: number;
    last: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function BookingPagination({ page, totalPages, last, onPrev, onNext }: Props) {
    const { t } = useLang(); // Lấy đối tượng dịch t

    if (totalPages <= 1) return null;

    // Xử lý chuỗi text thay thế động cho "Trang X / Y" hoặc "Page X of Y"
    const paginationText = t?.bookings?.pagination?.pageOf
        ? t.bookings.pagination.pageOf.replace("{current}", String(page + 1)).replace("{total}", String(totalPages))
        : `Trang ${page + 1} / ${totalPages}`;

    return (
        <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
                {paginationText}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onPrev}
                    disabled={page === 0}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-zinc-50">
                    {t?.bookings?.pagination?.prev ? `← ${t.bookings.pagination.prev}` : "← Trước"}
                </button>
                <button
                    onClick={onNext}
                    disabled={last}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-zinc-50">
                    {t?.bookings?.pagination?.next ? `${t.bookings.pagination.next} →` : "Tiếp →"}
                </button>
            </div>
        </div>
    );
}
"use client";

interface Props {
    page: number;
    totalPages: number;
    last: boolean;
    onPrev: () => void;
    onNext: () => void;
}

export default function EmployeePagination({ page, totalPages, last, onPrev, onNext }: Props) {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
                Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onPrev}
                    disabled={page === 0}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-zinc-50">
                    ← Trước
                </button>
                <button
                    onClick={onNext}
                    disabled={last}
                    className="rounded-lg border border-zinc-200 px-3 py-1 text-sm disabled:opacity-40 hover:bg-zinc-50">
                    Tiếp →
                </button>
            </div>
        </div>
    );
}
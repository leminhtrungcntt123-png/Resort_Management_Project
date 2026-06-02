"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Payment } from "@/types/payment";

interface Props {
  onClose: () => void;
  onConfirmed: () => void;
}

export default function PendingPaymentsModal({ onClose, onConfirmed }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Fetch danh sách pending
  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      try {
        const res = await api.get(`/api/payments/pending?page=${page}&size=10`);
        setPayments(res.data.content ?? []);
        setTotalPages(res.data.totalPages ?? 1);
      } catch (err) {
        console.error("Lỗi fetch pending:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, [page]);

  // Toggle chọn 1 item
  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Chọn / bỏ chọn tất cả trên trang hiện tại
  function toggleSelectAll() {
    const allIds = payments.map((p) => p.id);
    const allSelected = allIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      allIds.forEach((id) =>
        allSelected ? next.delete(id) : next.add(id)
      );
      return next;
    });
  }

  // Xác nhận thanh toán hàng loạt
  async function handleConfirmSelected() {
    if (selected.size === 0) return;
    setConfirming(true);
    setError("");
    try {
      // Gọi song song tất cả, không chờ từng cái
      await Promise.all(
        [...selected].map((id) => api.patch(`/api/payments/${id}/pay`))
      );
      onConfirmed();
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
      console.error(err);
    } finally {
      setConfirming(false);
    }
  }

  const allCurrentSelected =
    payments.length > 0 && payments.every((p) => selected.has(p.id));

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Thanh toán chờ xử lý
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              Đã chọn: {selected.size} hóa đơn
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Table */}
        <div className="mt-4 overflow-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allCurrentSelected}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Booking ID</th>
                <th className="px-4 py-3">Số tiền</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    Đang tải...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400">
                    🎉 Không có hóa đơn nào chờ xử lý!
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition ${
                      selected.has(p.id) ? "bg-yellow-50" : "hover:bg-zinc-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">#{p.bookingId}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {p.amount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">{p.paymentMethod}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    {/* Xác nhận từng cái */}
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          try {
                            await api.patch(`/api/payments/${p.id}/pay`);
                            onConfirmed();
                          } catch {
                            setError("Không thể xác nhận hóa đơn #" + p.bookingId);
                          }
                        }}
                        className="rounded-lg bg-green-100 px-3 py-1 text-xs
                                   font-medium text-green-700 hover:bg-green-200 transition"
                      >
                        Xác nhận
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-zinc-50"
            >
              ← Trước
            </button>
            <span className="text-zinc-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-lg border px-3 py-1 disabled:opacity-40 hover:bg-zinc-50"
            >
              Sau →
            </button>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm
                       text-zinc-600 hover:bg-zinc-50 transition"
          >
            Đóng
          </button>
          <button
            onClick={handleConfirmSelected}
            disabled={selected.size === 0 || confirming}
            className="rounded-lg bg-yellow-500 px-5 py-2 text-sm font-medium
                       text-white hover:bg-yellow-600 disabled:opacity-40 transition"
          >
            {confirming
              ? "Đang xử lý..."
              : `Xác nhận ${selected.size} hóa đơn`}
          </button>
        </div>
      </div>
    </div>
  );
}
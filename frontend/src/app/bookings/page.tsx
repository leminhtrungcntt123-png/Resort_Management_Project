"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Booking, BookingPageData } from "@/types/booking";
import BookingTable from "@/components/bookings/BookingTable";
import BookingFilter from "@/components/bookings/BookingFilter";
import BookingPagination from "@/components/bookings/BookingPagination";
import BookingDetailModal from "@/components/bookings/BookingDetailModal";

export default function BookingsPage() {
  const [data, setData] = useState<BookingPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [refresh, setRefresh] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const url =
          status === "ALL"
            ? `/api/bookings?page=${page}&size=10`
            : `/api/bookings/status/${status}?page=${page}&size=10`;
        const res = await api.get(url);
        console.log("bookings res:", JSON.stringify(res));
        setData(res.data);
      } catch (err) {
        console.error("Lỗi fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [page, status, refresh]);

  async function handleCheckin(id: number) {
    try {
      await api.put(`/api/bookings/${id}/checkin`, {});
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi check-in:", err);
    }
  }

  async function handleCheckout(id: number) {
    try {
      await api.put(`/api/bookings/${id}/checkout`, {});
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi check-out:", err);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await api.delete(`/api/bookings/${deleteId}`);
      setDeleteId(null);
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi xóa booking:", err);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">
            Quản lý Đặt phòng
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tổng: {data?.totalElements ?? "..."} đơn đặt phòng
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}

      {/* Confirm Xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-900">
              Xác nhận xóa
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Xóa booking này sẽ trả phòng về trạng thái AVAILABLE.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <BookingFilter
        status={status}
        onChange={(s) => {
          setStatus(s);
          setPage(0);
        }}
      />

      {/* Bảng */}
      <BookingTable
        bookings={data?.content ?? []}
        loading={loading}
        onCheckin={handleCheckin}
        onCheckout={handleCheckout}
        onDelete={(id) => setDeleteId(id)}
        onDetail={(booking) => setDetailBooking(booking)}
      />

      {/* Pagination */}
      {data && (
        <BookingPagination
          page={data.page}
          totalPages={data.totalPages}
          last={data.last}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </main>
  );
}

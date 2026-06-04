"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Booking, BookingPageData } from "@/types/booking";
import BookingTable from "@/components/bookings/BookingTable";
import BookingFilter from "@/components/bookings/BookingFilter";
import BookingPagination from "@/components/bookings/BookingPagination";
import BookingDetailModal from "@/components/bookings/BookingDetailModal";
import BookingCreateModal from "@/components/bookings/BookingCreateModal";

export default function BookingsPage() {
  const [data, setData] = useState<BookingPageData | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [refresh, setRefresh] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [qrCheckoutBooking, setQrCheckoutBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const url =
            status === "ALL"
                ? `/api/bookings?page=${page}&size=10`
                : `/api/bookings/status/${status}?page=${page}&size=10`;
        const res = await api.get(url);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    // Đã fix: Thêm từ khóa void để chặn warning "Promise returned is ignored"
    void fetchBookings();
  }, [page, status, refresh]);

  async function handleCheckin(id: number) {
    try {
      await api.put(`/api/bookings/${id}/checkin`, {});
      setRefresh((r) => r + 1);
    } catch (err) {
      console.error("Lỗi check-in:", err);
    }
  }

  async function handleCheckout(booking: Booking) {
    // Đã fix: Ép kiểu an toàn (Safe Type Assertion) thay vì dùng "any"
    type ExtendedBooking = Booking & { paymentMethod?: string };

    const method = booking.payment?.paymentMethod || (booking as ExtendedBooking).paymentMethod;
    const isPaid = booking.payment?.paymentStatus === "PAID";

    if (method === "QR" && !isPaid) {
      setQrCheckoutBooking(booking);
      return;
    }

    await executeCheckoutAPI(booking.id);
  }

  async function executeCheckoutAPI(id: number) {
    try {
      await api.put(`/api/bookings/${id}/checkout`, {});
      setRefresh((r) => r + 1);
      setQrCheckoutBooking(null);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Quản lý Đặt phòng
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Tổng: {data?.totalElements ?? "..."} đơn đặt phòng
            </p>
          </div>

          <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            + Đặt phòng
          </button>
        </div>

        {showCreateModal && (
            <BookingCreateModal
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                  setShowCreateModal(false);
                  setRefresh((r) => r + 1);
                }}
            />
        )}

        {detailBooking && (
            <BookingDetailModal
                booking={detailBooking}
                onClose={() => setDetailBooking(null)}
            />
        )}

        {qrCheckoutBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">Quét mã thanh toán</h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Khách hàng: <span className="font-semibold text-zinc-900">{qrCheckoutBooking.customer?.fullName}</span>
                  <br/>
                  Mã đơn: <span className="font-semibold text-zinc-900">#{qrCheckoutBooking.id}</span>
                </p>

                <div className="mx-auto bg-zinc-50 rounded-lg p-2 mb-6 w-48 h-48 flex items-center justify-center border border-zinc-200">
                  {/* Đã fix: Thêm cờ disable ESLint cho dòng img này để không bị báo vàng */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                      src={`https://img.vietqr.io/image/MB-0332458381-compact2.png?amount=6800000&addInfo=Thanh toan don ${qrCheckoutBooking.id}&accountName=VU TIEN`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                      onClick={() => setQrCheckoutBooking(null)}
                      className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                      onClick={() => executeCheckoutAPI(qrCheckoutBooking.id)}
                      className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Xác nhận đã quét
                  </button>
                </div>
              </div>
            </div>
        )}

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

        <BookingFilter
            status={status}
            onChange={(s) => {
              setStatus(s);
              setPage(0);
            }}
        />

        <BookingTable
            bookings={data?.content ?? []}
            loading={loading}
            onCheckin={handleCheckin}
            onCheckout={handleCheckout}
            onDelete={(id) => setDeleteId(id)}
            onDetail={(booking) => setDetailBooking(booking)}
        />

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
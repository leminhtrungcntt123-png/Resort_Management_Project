"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Booking } from "@/types/booking";
import { Service } from "@/types/service";

interface Props {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddServiceModal({
  booking,
  onClose,
  onSuccess,
}: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch danh sách dịch vụ
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get("/api/services");
        setServices(res.data ?? []);
        if (res.data?.length > 0) setServiceId(res.data[0].id);
      } catch {
        setError("Không thể tải danh sách dịch vụ!");
      } finally {
        setFetching(false);
      }
    }
    fetchServices();
  }, []);

  const selectedService = services.find((s) => s.id === serviceId);
  const subtotal = selectedService ? selectedService.price * quantity : 0;

  async function handleSubmit() {
    if (!serviceId) {
      setError("Vui lòng chọn dịch vụ!");
      return;
    }
    if (quantity < 1) {
      setError("Số lượng phải lớn hơn 0!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(`/api/bookings/${booking.id}/services`, {
        serviceId,
        quantity,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Thêm dịch vụ
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Booking #{booking.id} — {booking.customer?.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          {/* Chọn dịch vụ */}
          <div>
            <label className="text-sm font-medium text-zinc-700">Dịch vụ</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(Number(e.target.value))}
              disabled={fetching}
              className="mt-1.5 w-full rounded-xl border border-zinc-200
                                       px-3 py-2 text-sm focus:outline-none
                                       focus:ring-2 focus:ring-zinc-300"
            >
              {fetching ? (
                <option>Đang tải...</option>
              ) : (
                services.map((svc) => (
                  <option key={svc.id} value={svc.id}>
                    {svc.serviceName} — {svc.price.toLocaleString("vi-VN")}đ
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Số lượng */}
          <div>
            <label className="text-sm font-medium text-zinc-700">
              Số lượng
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-zinc-200
                                       px-3 py-2 text-sm focus:outline-none
                                       focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          {/* Preview tổng tiền */}
          {selectedService && (
            <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Đơn giá:</span>
                <span className="font-medium">
                  {selectedService.price.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-zinc-500">Số lượng:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div
                className="flex justify-between text-sm font-semibold
                                            mt-2 pt-2 border-t border-purple-100"
              >
                <span className="text-purple-700">Thành tiền:</span>
                <span className="text-purple-700">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5
                                   text-sm text-zinc-600 hover:bg-zinc-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || fetching}
            className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm
                                   font-medium text-white hover:bg-purple-700
                                   disabled:opacity-40 transition"
          >
            {loading ? "Đang thêm..." : "Thêm dịch vụ"}
          </button>
        </div>
      </div>
    </div>
  );
}

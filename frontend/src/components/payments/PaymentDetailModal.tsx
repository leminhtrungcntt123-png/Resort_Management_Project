"use client";

import { Payment } from "@/types/payment";
import { useLang } from "@/contexts/LangContext";

interface Props {
  payment: Payment;
  onClose: () => void;
}

export default function PaymentDetailModal({ payment, onClose }: Props) {
  const { t, lang } = useLang();
  const booking = payment.bookingDetail;
  const m = t?.payments?.modalDetail;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              {m?.title?.replace("{id}", String(payment.id)) ||
                `Chi tiết hóa đơn #${payment.id}`}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {m?.bookingRef?.replace("{id}", String(payment.bookingId)) ||
                `Booking #${payment.bookingId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Thông tin thanh toán */}
          <section>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              {m?.sectionBilling || "Thông tin thanh toán"}
            </p>
            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
              <Row
                label={m?.labelAmount || "Số tiền"}
                value={
                  lang === "en"
                    ? `${payment.amount?.toLocaleString("en-US")} VND`
                    : `${payment.amount?.toLocaleString("vi-VN")}đ`
                }
                highlight
              />
              {payment.discountAmount > 0 && (
                <Row
                  label={m?.labelDiscount || "Giảm giá VIP"}
                  value={
                    <span className="text-green-600">
                      -
                      {lang === "en"
                        ? `${payment.discountAmount?.toLocaleString("en-US")} VND`
                        : `${payment.discountAmount?.toLocaleString("vi-VN")}đ`}
                    </span>
                  }
                />
              )}
              <Row
                label={m?.labelMethod || "Phương thức"}
                value={payment.paymentMethod}
              />
              <Row
                label={m?.labelStatus || "Trạng thái"}
                value={
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium
                                        ${
                                          payment.paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                  >
                    {payment.paymentStatus === "PAID"
                      ? t?.payments?.status?.PAID || "Đã thanh toán"
                      : t?.payments?.status?.PENDING || "Chưa thanh toán"}
                  </span>
                }
              />
              <Row
                label={m?.labelDate || "Ngày thanh toán"}
                value={
                  payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString(
                        lang === "en" ? "en-US" : "vi-VN",
                      )
                    : t?.payments?.notPaidYet || "Chưa thanh toán"
                }
              />
            </div>
          </section>

          {/* Thông tin khách hàng */}
          {booking?.customer && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {m?.sectionCustomer || "Khách hàng"}
              </p>
              <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                <Row
                  label={m?.labelName || "Họ tên"}
                  value={booking.customer.fullName}
                />
                <Row
                  label={m?.labelPhone || "SĐT"}
                  value={booking.customer.phone}
                />
                <Row
                  label={m?.labelEmail || "Email"}
                  value={booking.customer.email}
                />
              </div>
            </section>
          )}

          {/* Phòng đã đặt */}
          {booking?.rooms && booking.rooms.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {m?.sectionRooms || "Phòng đã đặt"}
              </p>
              <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                {booking.rooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-sm text-zinc-600">
                      {m?.labelRoom
                        ?.replace("{number}", String(room.roomNumber))
                        ?.replace("{type}", room.roomTypeName || "") ||
                        `Phòng ${room.roomNumber} — ${room.roomTypeName}`}
                    </span>
                    <span className="text-sm font-medium text-zinc-900">
                      {lang === "en"
                        ? `${room.priceSnapshot?.toLocaleString("en-US")} VND`
                        : `${room.priceSnapshot?.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dịch vụ đã dùng */}
          {booking?.services && booking.services.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {m?.sectionServices || "Dịch vụ đã sử dụng"}
              </p>
              <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                {booking.services.map((svc) => (
                  <div key={svc.serviceId} className="px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-600">
                        {`${svc.serviceName} × ${svc.quantity}`}
                      </span>
                      {svc.priceOverride === 0 ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          Miễn phí VIP
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-zinc-900">
                          {lang === "en"
                            ? `${svc.subtotal?.toLocaleString("en-US")} VND`
                            : `${svc.subtotal?.toLocaleString("vi-VN")}đ`}
                        </span>
                      )}
                    </div>
                    {svc.bookedAt && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(svc.bookedAt).toLocaleString(
                          lang === "en" ? "en-US" : "vi-VN",
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Check-in / Check-out */}
          {booking && (
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                {m?.sectionStay || "Thời gian lưu trú"}
              </p>
              <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                <Row
                  label={m?.labelCheckIn || "Check-in"}
                  value={new Date(booking.checkInDate).toLocaleDateString(
                    lang === "en" ? "en-US" : "vi-VN",
                  )}
                />
                <Row
                  label={m?.labelCheckOut || "Check-out"}
                  value={new Date(booking.checkOutDate).toLocaleDateString(
                    lang === "en" ? "en-US" : "vi-VN",
                  )}
                />
                <Row
                  label={m?.labelBookingStatus || "Trạng thái booking"}
                  value={booking.status}
                />
              </div>
            </section>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-zinc-200 py-2.5
                               text-sm text-zinc-600 hover:bg-zinc-50 transition"
        >
          {m?.btnClose || "Đóng"}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-zinc-500">{label}</span>
      <span
        className={`text-sm font-medium ${highlight ? "text-green-700" : "text-zinc-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

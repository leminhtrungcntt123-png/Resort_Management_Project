"use client";

import { Payment } from "@/types/payment";

interface Props {
    payment: Payment;
    onClose: () => void;
}

export default function PaymentDetailModal({ payment, onClose }: Props) {
    const booking = payment.bookingDetail;

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
                            Chi tiết hóa đơn #{payment.id}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Booking #{payment.bookingId}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 text-xl font-bold">
                        ✕
                    </button>
                </div>

                <div className="mt-4 space-y-5">
                    {/* Thông tin thanh toán */}
                    <section>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Thông tin thanh toán
                        </p>
                        <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                            <Row label="Số tiền"
                                value={`${payment.amount?.toLocaleString("vi-VN")}đ`}
                                highlight />
                            <Row label="Phương thức" value={payment.paymentMethod} />
                            <Row label="Trạng thái"
                                value={
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium
                                        ${payment.paymentStatus === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"}`}>
                                        {payment.paymentStatus}
                                    </span>
                                }
                            />
                            <Row label="Ngày thanh toán"
                                value={payment.paymentDate
                                    ? new Date(payment.paymentDate).toLocaleDateString("vi-VN")
                                    : "Chưa thanh toán"} />
                        </div>
                    </section>

                    {/* Thông tin khách hàng */}
                    {booking?.customer && (
                        <section>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Khách hàng
                            </p>
                            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                                <Row label="Họ tên" value={booking.customer.fullName} />
                                <Row label="SĐT"    value={booking.customer.phone} />
                                <Row label="Email"  value={booking.customer.email} />
                            </div>
                        </section>
                    )}

                    {/* Phòng đã đặt */}
                    {booking?.rooms && booking.rooms.length > 0 && (
                        <section>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Phòng đã đặt
                            </p>
                            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                                {booking.rooms.map((room) => (
                                    <div key={room.roomId}
                                        className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-sm text-zinc-600">
                                            Phòng {room.roomNumber} — {room.roomTypeName}
                                        </span>
                                        <span className="text-sm font-medium text-zinc-900">
                                            {room.priceSnapshot?.toLocaleString("vi-VN")}đ
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
                                Dịch vụ đã sử dụng
                            </p>
                            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                                {booking.services.map((svc) => (
                                    <div key={svc.serviceId}
                                        className="flex items-center justify-between px-4 py-2.5">
                                        <span className="text-sm text-zinc-600">
                                            {svc.serviceName} × {svc.quantity}
                                        </span>
                                        <span className="text-sm font-medium text-zinc-900">
                                            {svc.subtotal?.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Check-in / Check-out */}
                    {booking && (
                        <section>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                                Thời gian lưu trú
                            </p>
                            <div className="rounded-xl border border-zinc-100 divide-y divide-zinc-50">
                                <Row label="Check-in"
                                    value={new Date(booking.checkInDate).toLocaleDateString("vi-VN")} />
                                <Row label="Check-out"
                                    value={new Date(booking.checkOutDate).toLocaleDateString("vi-VN")} />
                                <Row label="Trạng thái booking" value={booking.status} />
                            </div>
                        </section>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-xl border border-zinc-200 py-2.5
                               text-sm text-zinc-600 hover:bg-zinc-50 transition">
                    Đóng
                </button>
            </div>
        </div>
    );
}

// Helper component
function Row({ label, value, highlight }: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-zinc-500">{label}</span>
            <span className={`text-sm font-medium ${highlight ? "text-green-700" : "text-zinc-900"}`}>
                {value}
            </span>
        </div>
    );
}
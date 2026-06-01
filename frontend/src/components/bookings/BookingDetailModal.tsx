"use client";

import { Booking } from "@/types/booking";

interface Props {
    booking: Booking;
    onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: Props) {
    const totalAmount = booking.payment?.amount?.toLocaleString("vi-VN");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Chi tiết Booking #{booking.id}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 text-xl">
                        ✕
                    </button>
                </div>

                {/* Khách hàng */}
                <div className="mt-4 rounded-lg bg-zinc-50 p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Khách hàng</p>
                    <p className="mt-1 font-medium">{booking.customer?.fullName}</p>
                    <p className="text-sm text-zinc-500">{booking.customer?.phone} · {booking.customer?.email}</p>
                </div>

                {/* Ngày */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Check-in</p>
                        <p className="font-medium">{booking.checkInDate}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-3">
                        <p className="text-xs text-zinc-500">Check-out</p>
                        <p className="font-medium">{booking.checkOutDate}</p>
                    </div>
                </div>

                {/* Phòng */}
                <div className="mt-3">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Phòng</p>
                    <div className="mt-1 flex flex-col gap-1">
                        {booking.rooms?.map(room => (
                            <div key={room.roomId}
                                className="flex justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm">
                                <span>Phòng {room.roomNumber} — {room.roomTypeName}</span>
                                <span className="text-zinc-500">
                                    {room.priceSnapshot?.toLocaleString("vi-VN")}đ/đêm
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dịch vụ */}
                {booking.services?.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs font-medium text-zinc-500 uppercase">Dịch vụ</p>
                        <div className="mt-1 flex flex-col gap-1">
                            {booking.services.map(svc => (
                                <div key={svc.serviceId}
                                    className="flex justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm">
                                    <span>{svc.serviceName} × {svc.quantity}</span>
                                    <span className="text-zinc-500">
                                        {svc.subtotal?.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Thanh toán */}
                <div className="mt-3 rounded-lg bg-zinc-50 p-4">
                    <p className="text-xs font-medium text-zinc-500 uppercase">Thanh toán</p>
                    <div className="mt-2 flex justify-between">
                        <span className="text-sm">Tổng tiền</span>
                        <span className="font-semibold">{totalAmount}đ</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-sm">Phương thức</span>
                        <span className="text-sm">{booking.payment?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-sm">Trạng thái</span>
                        <span className={`text-sm font-medium
                            ${booking.payment?.paymentStatus === "PAID"
                                ? "text-green-600" : "text-yellow-600"}`}>
                            {booking.payment?.paymentStatus}
                        </span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-lg border border-zinc-200 py-2 text-sm hover:bg-zinc-50">
                    Đóng
                </button>
            </div>
        </div>
    );
}
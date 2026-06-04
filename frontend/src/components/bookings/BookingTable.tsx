"use client";

import { Booking } from "@/types/booking";

interface Props {
    bookings: Booking[];
    loading: boolean;
    onCheckin:  (id: number) => void;
    onCheckout: (booking: Booking) => void; // Đã fix nhận nguyên object
    onDelete:   (id: number) => void;
    onDetail:   (booking: Booking) => void;
}

const STATUS_STYLE: Record<string, string> = {
    PENDING:     "bg-yellow-100 text-yellow-700",
    CONFIRMED:   "bg-blue-100 text-blue-700",
    CHECKED_IN:  "bg-green-100 text-green-700",
    CHECKED_OUT: "bg-zinc-100 text-zinc-600",
    CANCELLED:   "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
    PENDING:     "Chờ xác nhận",
    CONFIRMED:   "Đã xác nhận",
    CHECKED_IN:  "Đang ở",
    CHECKED_OUT: "Đã trả phòng",
    CANCELLED:   "Đã hủy",
};

export default function BookingTable({
                                         bookings, loading, onCheckin, onCheckout, onDelete, onDetail
                                     }: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Khách hàng</th>
                    <th className="px-4 py-3 text-left">Check-in</th>
                    <th className="px-4 py-3 text-left">Check-out</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Thanh toán</th>
                    <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                {loading ? (
                    <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                            Đang tải...
                        </td>
                    </tr>
                ) : bookings.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                            Không có dữ liệu
                        </td>
                    </tr>
                ) : bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 font-medium">#{booking.id}</td>
                        <td className="px-4 py-3">
                            <p className="font-medium">{booking.customer?.fullName}</p>
                            <p className="text-xs text-zinc-400">{booking.customer?.phone}</p>
                        </td>
                        <td className="px-4 py-3">{booking.checkInDate}</td>
                        <td className="px-4 py-3">{booking.checkOutDate}</td>
                        <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${STATUS_STYLE[booking.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                                    {STATUS_LABEL[booking.status] ?? booking.status}
                                </span>
                        </td>
                        <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${booking.payment?.paymentStatus === "PAID"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"}`}>
                                    {booking.payment?.paymentStatus ?? "—"}
                                </span>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                                <button
                                    onClick={() => onDetail(booking)}
                                    className="rounded-lg border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50">
                                    Chi tiết
                                </button>
                                {booking.status === "PENDING" && (
                                    <button
                                        onClick={() => onCheckin(booking.id)}
                                        className="rounded-lg border border-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50">
                                        Check-in
                                    </button>
                                )}
                                {booking.status === "CHECKED_IN" && (
                                    <button
                                        onClick={() => onCheckout(booking)}
                                        className="rounded-lg border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">
                                        Check-out
                                    </button>
                                )}
                                <button
                                    onClick={() => onDelete(booking.id)}
                                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                                    Xóa
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
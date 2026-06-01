"use client";

import { Payment } from "@/types/payment";

interface Props {
    payments: Payment[];
    loading: boolean;
    onMarkPaid: (id: number) => void;
}

export default function PaymentTable({ payments, loading, onMarkPaid }: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Booking</th>
                        <th className="px-4 py-3 text-left">Số tiền</th>
                        <th className="px-4 py-3 text-left">Phương thức</th>
                        <th className="px-4 py-3 text-left">Trạng thái</th>
                        <th className="px-4 py-3 text-left">Ngày thanh toán</th>
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
                    ) : payments.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-3 font-medium">#{payment.id}</td>
                            <td className="px-4 py-3">
                                <span className="text-blue-600">#{payment.bookingId}</span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                                {payment.amount?.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="px-4 py-3">{payment.paymentMethod}</td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${payment.paymentStatus === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"}`}>
                                    {payment.paymentStatus}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-500">
                                {payment.paymentDate
                                    ? new Date(payment.paymentDate).toLocaleDateString("vi-VN")
                                    : "—"}
                            </td>
                            <td className="px-4 py-3">
                                {payment.paymentStatus === "PENDING" && (
                                    <button
                                        onClick={() => onMarkPaid(payment.id)}
                                        className="rounded-lg border border-green-200 px-3 py-1 text-xs text-green-700 hover:bg-green-50">
                                        Xác nhận thanh toán
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
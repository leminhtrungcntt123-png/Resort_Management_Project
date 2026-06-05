"use client";

import { useState } from "react";
import { Payment } from "@/types/payment";
import { useAuth } from "@/contexts/AuthContext";
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentEditModal from "./PaymentEditModal";
import { useLang } from "@/contexts/LangContext";

interface Props {
    payments: Payment[];
    loading: boolean;
    onMarkPaid: (id: number) => void;
    onDeleted: () => void;
    onUpdated: () => void;
}

export default function PaymentTable({
    payments, loading, onMarkPaid, onDeleted, onUpdated
}: Props) {
    const { isAdmin } = useAuth();
    const { t, lang } = useLang();
    const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
    const [editPayment, setEditPayment]     = useState<Payment | null>(null);

    return (
        <>
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.id || "ID"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.booking || "Booking"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.amount || "Số tiền"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.method || "Phương thức"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.status || "Trạng thái"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.date || "Ngày thanh toán"}</th>
                        <th className="px-4 py-3 text-left">{t?.payments?.tableHeaders?.actions || "Thao tác"}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                                {t?.payments?.loading || "Đang tải..."}
                            </td>
                        </tr>
                    ) : payments.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                                {t?.payments?.empty || "Không có dữ liệu"}
                            </td>
                        </tr>
                    ) : payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-3 font-medium">#{payment.id}</td>
                            <td className="px-4 py-3">
                                <span className="text-blue-600">#{payment.bookingId}</span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                                {lang === "en"
                                    ? `${payment.amount?.toLocaleString("en-US")} VND`
                                    : `${payment.amount?.toLocaleString("vi-VN")}đ`}
                            </td>
                            <td className="px-4 py-3">{payment.paymentMethod}</td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium
                                    ${payment.paymentStatus === "PAID"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"}`}>
                                    {payment.paymentStatus === "PAID"
                                        ? (t?.payments?.status?.PAID || "Đã thanh toán")
                                        : (t?.payments?.status?.PENDING || "Chưa thanh toán")}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-zinc-500">
                                {payment.paymentDate
                                    ? new Date(payment.paymentDate).toLocaleDateString(lang === "en" ? "en-US" : "vi-VN")
                                    : "—"}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    {/* Xác nhận thanh toán */}
                                    {payment.paymentStatus === "PENDING" && (
                                        <button
                                            onClick={() => onMarkPaid(payment.id)}
                                            className="rounded-lg border border-green-200 px-3 py-1
                                                       text-xs text-green-700 hover:bg-green-50">
                                            {t?.payments?.actionButtons?.confirm || "Xác nhận"}
                                        </button>
                                    )}

                                    {/* Xem chi tiết */}
                                    <button
                                        onClick={() => setDetailPayment(payment)}
                                        className="rounded-lg border border-blue-200 px-3 py-1
                                                   text-xs text-blue-700 hover:bg-blue-50">
                                        {t?.payments?.actionButtons?.detail || "Chi tiết"}
                                    </button>

                                    {/* Sửa phương thức */}
                                    <button
                                        onClick={() => setEditPayment(payment)}
                                        className="rounded-lg border border-zinc-200 px-3 py-1
                                                   text-xs text-zinc-700 hover:bg-zinc-50">
                                        {t?.payments?.actionButtons?.edit || "Sửa"}
                                    </button>

                                    {/* Xóa — chỉ ADMIN */}
                                    {isAdmin && (
                                        <button
                                            onClick={async () => {
                                                const confirmMsg = t?.payments?.alerts?.confirmDelete?.replace("{id}", String(payment.id)) || `Xóa hóa đơn #${payment.id}?`;
                                                if (!confirm(confirmMsg)) return;
                                                try {
                                                    await fetch(
                                                        `http://localhost:8080/api/payments/${payment.id}`,
                                                        {
                                                            method: "DELETE",
                                                            headers: {
                                                                Authorization: `Bearer ${localStorage.getItem("token")}`
                                                            }
                                                        }
                                                    );
                                                    onDeleted();
                                                } catch {
                                                    alert(t?.payments?.alerts?.deleteError || "Không thể xóa hóa đơn!");
                                                }
                                            }}
                                            className="rounded-lg border border-red-200 px-3 py-1
                                                       text-xs text-red-600 hover:bg-red-50">
                                            {t?.payments?.actionButtons?.delete || "Xóa"}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Modal chi tiết */}
        {detailPayment && (
            <PaymentDetailModal
                payment={detailPayment}
                onClose={() => setDetailPayment(null)}
            />
        )}

        {/* Modal sửa */}
        {editPayment && (
            <PaymentEditModal
                payment={editPayment}
                onClose={() => setEditPayment(null)}
                onUpdated={() => {
                    setEditPayment(null);
                    onUpdated();
                }}
            />
        )}
        </>
    );
}
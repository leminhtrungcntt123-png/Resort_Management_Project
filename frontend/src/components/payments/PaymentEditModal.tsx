"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { Payment } from "@/types/payment";

interface Props {
    payment: Payment;
    onClose: () => void;
    onUpdated: () => void;
}

export default function PaymentEditModal({ payment, onClose, onUpdated }: Props) {
    const [method, setMethod]   = useState(payment.paymentMethod);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState("");

    async function handleSubmit() {
        setLoading(true);
        setError("");
        try {
            await api.put(`/api/payments/${payment.id}`, {
                amount: payment.amount,
                paymentMethod: method,
            });
            onUpdated();
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
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
                <h3 className="text-lg font-semibold text-zinc-900">
                    Sửa hóa đơn #{payment.id}
                </h3>

                {error && (
                    <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-4">
                    <label className="text-sm font-medium text-zinc-700">
                        Phương thức thanh toán
                    </label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2
                                   text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    >
                        <option value="CASH">CASH — Tiền mặt</option>
                        <option value="CARD">CARD — Thẻ ngân hàng</option>
                    </select>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-200 py-2.5
                                   text-sm text-zinc-600 hover:bg-zinc-50 transition">
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm
                                   font-medium text-white hover:bg-zinc-700
                                   disabled:opacity-40 transition">
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
}
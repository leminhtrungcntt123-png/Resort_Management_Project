"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";

interface CustomerOption {
    id: number;
    fullName: string;
    phone: string;
}

interface RoomOption {
    id: number;
    roomNumber: string;
    roomType?: {
        typeName: string;
    };
}

interface BookingCreateModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookingCreateModal({ onClose, onSuccess }: BookingCreateModalProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [isNewCustomer, setIsNewCustomer] = useState(false);

    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [newCustomerEmail, setNewCustomerEmail] = useState("");

    const [customerId, setCustomerId] = useState<number | "">("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [roomId, setRoomId] = useState<number | "">("");
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const [customers, setCustomers] = useState<CustomerOption[]>([]);
    const [rooms, setRooms] = useState<RoomOption[]>([]);

    // Lấy ngày hiện tại chuẩn YYYY-MM-DD để chặn đặt phòng quá khứ
    const todayStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

    useEffect(() => {
        async function fetchOptions() {
            try {
                const [custRes, roomRes] = await Promise.all([
                    api.get("/api/customers?size=100"),
                    api.get("/api/rooms/status/AVAILABLE?size=100")
                ]);
                setCustomers(custRes.data?.data?.content || custRes.data?.content || []);
                setRooms(roomRes.data?.data?.content || roomRes.data?.content || []);
            } catch (err) {
                console.error("Lỗi lấy dữ liệu form:", err);
            }
        }
        void fetchOptions();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!checkInDate || !checkOutDate || !roomId) {
            setError("Vui lòng điền đầy đủ thông tin phòng và ngày.");
            return;
        }

        if (isNewCustomer && (!newCustomerName || !newCustomerPhone)) {
            setError("Vui lòng nhập Tên và Số điện thoại cho khách mới.");
            return;
        }

        if (!isNewCustomer && !customerId) {
            setError("Vui lòng chọn một khách hàng cũ.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            let finalCustomerId = customerId;

            if (isNewCustomer) {
                const custRes = await api.post("/api/customers", {
                    fullName: newCustomerName,
                    phone: newCustomerPhone,
                    email: newCustomerEmail
                });
                finalCustomerId = custRes.data?.data?.id || custRes.data?.id;
            }

            await api.post("/api/bookings", {
                customerId: Number(finalCustomerId),
                checkInDate,
                checkOutDate,
                roomIds: [Number(roomId)],
                paymentMethod
            });

            onSuccess();
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorObj?.response?.data?.message || errorObj?.message || "Có lỗi xảy ra khi xử lý");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Tạo đơn đặt phòng mới</h3>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-zinc-900">Thông tin khách hàng</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="newCustomer"
                                    checked={isNewCustomer}
                                    onChange={(e) => setIsNewCustomer(e.target.checked)}
                                    className="rounded border-zinc-300"
                                />
                                <label htmlFor="newCustomer" className="text-sm text-blue-600 cursor-pointer font-medium">
                                    + Thêm khách mới
                                </label>
                            </div>
                        </div>

                        {isNewCustomer ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Họ và tên *"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Số điện thoại *"
                                        value={newCustomerPhone}
                                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email (Tùy chọn)"
                                        value={newCustomerEmail}
                                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
                                className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none focus:border-zinc-900 text-sm"
                            >
                                <option value="">-- Tra cứu khách hàng cũ --</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.phone} - {c.fullName}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">Ngày Check-in *</label>
                            <input
                                type="date"
                                min={todayStr}
                                value={checkInDate}
                                onChange={(e) => setCheckInDate(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-zinc-700">Ngày Check-out *</label>
                            <input
                                type="date"
                                min={checkInDate || todayStr}
                                value={checkOutDate}
                                onChange={(e) => setCheckOutDate(e.target.value)}
                                className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">Chọn Phòng *</label>
                        <select
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : "")}
                            className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                        >
                            <option value="">-- Chỉ hiển thị phòng TRỐNG --</option>
                            {rooms.map((r) => (
                                <option key={r.id} value={r.id}>P.{r.roomNumber} - {r.roomType?.typeName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-700">Phương thức thanh toán</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full rounded-lg border border-zinc-300 p-2.5 outline-none text-sm"
                        >
                            <option value="CASH">Tiền mặt (CASH)</option>
                            <option value="CARD">Thẻ quẹt (CARD)</option>
                            <option value="QR">Chuyển khoản / Mã QR (QR)</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                        >
                            {saving ? "Đang xử lý..." : "Xác nhận đặt"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
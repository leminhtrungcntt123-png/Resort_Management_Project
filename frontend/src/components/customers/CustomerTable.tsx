"use client";

import { Customer } from "@/types/customer";

interface Props {
    customers: Customer[];
    loading: boolean;
    onEdit: (customer: Customer) => void;
    onDelete: (id: number) => void;
}

export default function CustomerTable({ customers, loading, onEdit, onDelete }: Props) {
    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 text-left">Họ tên</th>
                        <th className="px-4 py-3 text-left">Số điện thoại</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Điểm tích lũy</th>
                        <th className="px-4 py-3 text-left">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                                Đang tải...
                            </td>
                        </tr>
                    ) : customers.map(customer => (
                        <tr key={customer.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-3 font-medium">{customer.fullName}</td>
                            <td className="px-4 py-3">{customer.phone ?? "—"}</td>
                            <td className="px-4 py-3">{customer.email ?? "—"}</td>
                            <td className="px-4 py-3">{customer.loyaltyPoints}</td>
                            <td className="px-4 py-3 flex gap-2">
                                <button
                                    onClick={() => onEdit(customer)}
                                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50">
                                    Sửa
                                </button>
                                <button
                                    onClick={() => onDelete(customer.id)}
                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                                    Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
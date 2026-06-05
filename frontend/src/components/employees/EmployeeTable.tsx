"use client";

import { Employee } from "@/types/employee";
import { useLang } from "@/contexts/LangContext";

interface Props {
    employees: Employee[];
    loading: boolean;
    onEdit: (employee: Employee) => void;
    onDelete: (id: number) => void;
}

export default function EmployeeTable({ employees, loading, onEdit, onDelete }: Props) {
    const { t, lang } = useLang();
    const headers = t?.employees?.tableHeaders;

    return (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                    <tr>
                        <th className="px-4 py-3 text-left">{headers?.name || "Họ tên"}</th>
                        <th className="px-4 py-3 text-left">{headers?.phone || "Số điện thoại"}</th>
                        <th className="px-4 py-3 text-left">{headers?.email || "Email"}</th>
                        <th className="px-4 py-3 text-left">{headers?.position || "Chức vụ"}</th>
                        <th className="px-4 py-3 text-left">{headers?.salary || "Lương"}</th>
                        <th className="px-4 py-3 text-left">{headers?.actions || "Thao tác"}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                                {t?.employees?.loading || "Đang tải..."}
                            </td>
                        </tr>
                    ) : employees.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                                {t?.employees?.empty || "Không có dữ liệu"}
                            </td>
                        </tr>
                    ) : employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-zinc-50">
                            <td className="px-4 py-3 font-medium">{emp.fullName}</td>
                            <td className="px-4 py-3">{emp.phone ?? "—"}</td>
                            <td className="px-4 py-3">{emp.email ?? "—"}</td>
                            <td className="px-4 py-3">{emp.position ?? "—"}</td>
                            <td className="px-4 py-3">
                                {emp.salary
                                    ? lang === "en"
                                        ? emp.salary.toLocaleString("en-US") + " VND"
                                        : emp.salary.toLocaleString("vi-VN") + "đ"
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                                <button
                                    onClick={() => onEdit(emp)}
                                    className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50">
                                    {t?.payments?.actionButtons?.edit || "Sửa"}
                                </button>
                                <button
                                    onClick={() => onDelete(emp.id)}
                                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                                    {t?.payments?.actionButtons?.delete || "Xóa"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
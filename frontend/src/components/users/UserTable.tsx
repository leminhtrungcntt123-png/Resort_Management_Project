"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { User } from "@/types/user";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";

interface Props {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-blue-100 text-blue-700",
  RECEPTIONIST: "bg-zinc-100 text-zinc-600",
};

export default function UserTable({ users, loading, onRefresh }: Props) {
  const { isAdmin, username } = useAuth();
  const { t } = useLang();
  const usrLang = t?.users;

  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleToggleLock(id: number) {
    setLoadingId(id);
    try {
      await api.patch(`/api/users/${id}/lock`);
      onRefresh();
    } catch (err) {
      console.error("Lỗi toggle lock:", err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: number, uName: string) {
    const confirmMsg = (usrLang?.modal?.confirmDelete || 'Xóa tài khoản "{username}"?').replace("{username}", uName);
    if (!confirm(confirmMsg)) return;
    try {
      await api.delete(`/api/users/${id}`);
      onRefresh();
    } catch (err) {
      console.error("Lỗi xóa user:", err);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-500">
          <tr>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.id || "ID"}</th>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.username || "Username"}</th>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.role || "Role"}</th>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.employee || "Nhân viên"}</th>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.status || "Trạng thái"}</th>
            <th className="px-4 py-3 text-left">{usrLang?.tableHeaders?.actions || "Thao tác"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                {usrLang?.loading || "Đang tải..."}
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                {usrLang?.empty || "Không có tài khoản nào"}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-400">#{user.id}</td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold
                                    ${ROLE_BADGE[user.role] ?? ROLE_BADGE.RECEPTIONIST}`}
                  >
                    {usrLang?.modal?.roleOptions?.[user.role as keyof typeof usrLang.modal.roleOptions] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {user.employeeName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold
                                    ${
                                      user.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-600"
                                    }`}
                  >
                    {user.isActive
                      ? (usrLang?.statusOptions?.active || "Hoạt động")
                      : (usrLang?.statusOptions?.locked || "Đã khóa")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Lock/Unlock */}
                    {isAdmin && user.username !== username && (
                      <button
                        onClick={() => handleToggleLock(user.id)}
                        disabled={loadingId === user.id}
                        className={`rounded-lg border px-3 py-1 text-xs transition disabled:opacity-40
                                                   ${
                                                     user.isActive
                                                       ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                                                       : "border-green-200 text-green-700 hover:bg-green-50"
                                                   }`}
                      >
                        {loadingId === user.id
                          ? "..."
                          : user.isActive
                            ? (usrLang?.actionButtons?.lock || "Khóa")
                            : (usrLang?.actionButtons?.unlock || "Mở khóa")}
                      </button>
                    )}
                    {/* Xóa — chỉ ADMIN */}
                    {isAdmin && user.username !== username && (
                      <button
                        onClick={() => handleDelete(user.id, user.username)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 transition"
                      >
                        {t?.rooms?.actionButtons?.delete || "Xóa"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
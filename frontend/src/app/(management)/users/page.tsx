"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { User } from "@/types/user";
import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import { useLang } from "@/contexts/LangContext";

export default function UsersPage() {
    const { t } = useLang();
    const usrLang = t?.users;

    const [users, setUsers]         = useState<User[]>([]);
    const [loading, setLoading]     = useState(true);
    const [refresh, setRefresh]     = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const res = await api.get("/api/users");
                setUsers(res.data ?? []);
            } catch (err) {
                console.error("Lỗi fetch users:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [refresh]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">
                        {usrLang?.title || "Quản lý Tài khoản"}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {usrLang?.totalPrefix || "Tổng:"} {users.length} {usrLang?.totalSuffix || "tài khoản"}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition"
                >
                    {usrLang?.btnCreate || "+ Tạo tài khoản"}
                </button>
            </div>

            {/* Table */}
            <UserTable
                users={users}
                loading={loading}
                onRefresh={() => setRefresh((r) => r + 1)}
            />

            {/* Modal tạo mới */}
            {showModal && (
                <UserModal
                    onClose={() => setShowModal(false)}
                    onCreated={() => {
                        setShowModal(false);
                        setRefresh((r) => r + 1);
                    }}
                />
            )}
        </div>
    );
}
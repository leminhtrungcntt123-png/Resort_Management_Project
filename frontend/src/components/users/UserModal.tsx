"use client";

import { useState } from "react";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";

interface Props {
    onClose: () => void;
    onCreated: () => void;
}

export default function UserModal({ onClose, onCreated }: Props) {
    const { isAdmin } = useAuth();
    const { t } = useLang();
    const uModal = t?.users?.modal;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole]         = useState("RECEPTIONIST");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    // ADMIN tạo được mọi role
    // MANAGER chỉ tạo được RECEPTIONIST
    const availableRoles = isAdmin
        ? ["ADMIN", "MANAGER", "RECEPTIONIST"]
        : ["RECEPTIONIST"];

    async function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            setError(uModal?.errorRequired || "Vui lòng điền đầy đủ thông tin!");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await api.post("/api/users", { username, password, role });
            onCreated();
        } catch (err: any) {
            setError(err.message || (uModal?.errorDefault || "Có lỗi xảy ra"));
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-900">
                        {uModal?.createTitle || "Tạo tài khoản mới"}
                    </h3>
                    <button onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 text-xl font-bold">
                        ✕
                    </button>
                </div>

                {error && (
                    <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-4 space-y-4">
                    {/* Username */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {uModal?.username || "Username"}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={uModal?.placeholderUsername || "Tối thiểu 4 ký tự"}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {uModal?.password || "Mật khẩu"}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={uModal?.placeholderPassword || "Tối thiểu 6 ký tự"}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-sm font-medium text-zinc-700">
                            {uModal?.role || "Role"}
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
                        >
                            {availableRoles.map((r) => (
                                <option key={r} value={r}>
                                    {uModal?.roleOptions?.[r as keyof typeof uModal.roleOptions] || r}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition">
                        {uModal?.btnCancel || "Hủy"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition">
                        {loading ? (uModal?.btnCreating || "Đang tạo...") : (uModal?.btnCreate || "Tạo tài khoản")}
                    </button>
                </div>
            </div>
        </div>
    );
}
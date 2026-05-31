"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/api/auth/login", { username, password });
            localStorage.setItem("token", res.data.token);
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-zinc-900">
                    Đăng nhập
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Resort Management System
                </p>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-zinc-700">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </main>
    );
}
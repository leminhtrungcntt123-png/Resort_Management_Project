"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        <main className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
            {/* LỚP TRÁI: KHU VỰC FORM ĐĂNG NHẬP (40% MÀN HÌNH) */}
            <div className="flex w-full flex-col justify-between p-8 md:w-[40%] lg:p-12 xl:p-16 z-10 bg-zinc-900/90 backdrop-blur-md">
                {/* Logo / Brand Header */}
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-serif text-xl font-bold italic shadow-lg shadow-amber-500/5">
                        R
                    </div>
                    <span className="font-serif text-lg font-medium tracking-widest text-zinc-200 uppercase">
                        The Luxury Resort
                    </span>
                </div>

                {/* Main Login Form Container */}
                <div className="mx-auto my-auto w-full max-w-sm py-12">
                    <div className="space-y-2">
                        <h1 className="font-serif text-3xl font-light tracking-tight text-white lg:text-4xl">
                            Chào mừng trở lại
                        </h1>
                        <p className="text-sm font-light tracking-wide text-zinc-400">
                            Hệ thống quản trị và vận hành cao cấp
                        </p>
                    </div>

                    <style>{`
                        .lx-input-wrap {
                            display: flex;
                            align-items: center;
                            border-radius: 10px;
                            border: 1px solid #3f3f46;
                            background: rgba(39,39,42,0.7);
                            transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                        }
                        .lx-input-wrap:focus-within {
                            border-color: #f59e0b;
                            background: #27272a;
                            box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
                        }
                        .lx-input-wrap:focus-within .lx-icon {
                            color: #f59e0b;
                        }
                        .lx-input {
                            width: 100%;
                            background: transparent;
                            border: none;
                            outline: none;
                            padding: 13px 14px 13px 10px;
                            font-size: 14px;
                            font-weight: 300;
                            color: #fff;
                            letter-spacing: 0.01em;
                        }
                        .lx-input::placeholder { color: #52525b; }
                        .lx-label {
                            display: block;
                            font-size: 10px;
                            font-weight: 600;
                            letter-spacing: 0.18em;
                            text-transform: uppercase;
                            color: #71717a;
                            margin-bottom: 8px;
                            transition: color 0.2s;
                        }
                        .lx-field:focus-within .lx-label { color: #fbbf24; }
                        .lx-btn {
                            position: relative;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            height: 50px;
                            margin-top: 20px;
                            border: none;
                            border-radius: 10px;
                            background: #f59e0b;
                            color: #0a0a0a;
                            font-size: 12px;
                            font-weight: 700;
                            letter-spacing: 0.15em;
                            text-transform: uppercase;
                            cursor: pointer;
                            overflow: hidden;
                            transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
                            box-shadow: 0 4px 24px rgba(245,158,11,0.25);
                        }
                        .lx-btn:hover { background: #fbbf24; box-shadow: 0 6px 32px rgba(245,158,11,0.35); }
                        .lx-btn:active { transform: scale(0.98); }
                        .lx-btn:disabled { opacity: 0.45; cursor: not-allowed; }
                        .lx-btn-shimmer {
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
                            transform: translateX(-100%);
                            transition: transform 0.6s;
                        }
                        .lx-btn:hover .lx-btn-shimmer { transform: translateX(100%); }
                        .lx-icon { color: #52525b; transition: color 0.2s; flex-shrink: 0; margin-left: 14px; }
                        .lx-eye-btn {
                            background: none;
                            border: none;
                            cursor: pointer;
                            padding: 0 12px;
                            color: #52525b;
                            display: flex;
                            align-items: center;
                            transition: color 0.15s;
                        }
                        .lx-eye-btn:hover { color: #f59e0b; }
                    `}</style>

                    <form onSubmit={handleSubmit} style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: "22px" }}>
                        {/* Input Tên đăng nhập */}
                        <div className="lx-field">
                            <label className="lx-label">Tên đăng nhập</label>
                            <div className="lx-input-wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="lx-icon" style={{ width: 16, height: 16 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="lx-input"
                                    placeholder="Nhập tài khoản quản trị..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Input Mật khẩu */}
                        <div className="lx-field">
                            <label className="lx-label">Mật khẩu</label>
                            <div className="lx-input-wrap">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="lx-icon" style={{ width: 16, height: 16 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="lx-input"
                                    style={{ paddingRight: 0 }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="lx-eye-btn">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message Box */}
                        {error && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", padding: "12px 16px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: "#f87171" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <span style={{ fontSize: 13, fontWeight: 300, color: "#f87171" }}>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button type="submit" disabled={loading} className="lx-btn">
                            <span className="lx-btn-shimmer" />
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                                    <svg style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                                        <circle style={{ opacity: 0.3 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span style={{ fontWeight: 300, letterSpacing: "0.05em" }}>Đang xác thực...</span>
                                </span>
                            ) : (
                                <span style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                                    Đăng nhập hệ thống
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer hệ thống */}
                <div className="text-center md:text-left">
                    <p className="text-[10px] font-light tracking-wider text-zinc-600 uppercase">
                        © 2026 Resort Management System. All rights reserved.
                    </p>
                </div>
            </div>

            {/* LỚP PHẢI: HÌNH ẢNH CĂN PHÒNG LUXURY (60% MÀN HÌNH) */}
            <div className="relative hidden h-screen w-[60%] overflow-hidden md:block">
                {/* Lớp phủ mờ nhẹ tinh tế */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950/20" />
                <div className="absolute inset-0 z-10 bg-black/10" />

                {/* Ảnh Phòng Resort Đầy Đủ Tiện Nghi, View Biển Hoàng Hôn Siêu Đẹp */}
                <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80"
                    alt="Luxury Resort Room View"
                    className="h-full w-full object-cover transition-transform duration-10000 ease-out scale-105 hover:scale-100"
                    loading="eager"
                />

                {/* Quote Nghệ Thuật nằm ở góc phải */}
                <div className="absolute bottom-16 right-16 z-20 max-w-lg space-y-4 font-serif text-right">
                    <p className="text-3xl font-light italic leading-relaxed text-zinc-100">
                        "Luxury is in each detail."
                    </p>
                    <p className="text-sm font-sans font-medium tracking-widest text-amber-300 uppercase">
                        — Hubert de Givenchy
                    </p>
                </div>
            </div>
        </main>
    );
}
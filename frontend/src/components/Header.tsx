"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LogOut, KeyRound } from "lucide-react";
import ChangePasswordModal from "@/components/ChangePasswordModal";

const ROLE_BADGE: Record<string, string> = {
    ADMIN:        "bg-red-100 text-red-700 border border-red-200",
    MANAGER:      "bg-blue-100 text-blue-700 border border-blue-200",
    RECEPTIONIST: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

export default function Header() {
    const { username, role, formattedRole } = useAuth();
    const [open, setOpen]                   = useState(false);
    const [showChangePwd, setShowChangePwd] = useState(false);
    const dropdownRef                       = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    const avatar     = username ? username.charAt(0).toUpperCase() : "?";
    const badgeStyle = ROLE_BADGE[role ?? ""] ?? ROLE_BADGE.RECEPTIONIST;

    return (
        <>
        <header className="sticky top-0 z-40 flex h-16 w-full items-center
                           justify-between border-b border-zinc-200
                           bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                    Resort Operating System
                </p>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />

                {username && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((o) => !o)}
                            className="flex items-center gap-2.5 rounded-xl border border-zinc-200
                                       bg-white px-3 py-1.5 shadow-sm transition hover:bg-zinc-50"
                        >
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}>
                                {formattedRole}
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center
                                            rounded-full bg-zinc-900 text-xs font-bold text-white">
                                {avatar}
                            </div>
                        </button>

                        {open && (
                            <div className="absolute right-0 top-11 w-48 rounded-xl border
                                            border-zinc-200 bg-white shadow-lg overflow-hidden z-50">
                                {/* Đổi mật khẩu */}
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        setShowChangePwd(true);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-3
                                               text-sm text-zinc-700 hover:bg-zinc-50 transition"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Đổi mật khẩu
                                </button>

                                <div className="border-t border-zinc-100" />

                                {/* Đăng xuất */}
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2.5 px-4 py-3
                                               text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>

        {/* Modal đổi mật khẩu */}
        {showChangePwd && (
            <ChangePasswordModal onClose={() => setShowChangePwd(false)} />
        )}
        </>
    );
}
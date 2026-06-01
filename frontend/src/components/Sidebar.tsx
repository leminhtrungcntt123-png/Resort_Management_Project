"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
    { label: "Tổng quan",    href: "/",           icon: "📊" },
    { label: "Phòng",        href: "/rooms",       icon: "🏨" },
    { label: "Đặt phòng",    href: "/bookings",    icon: "📋" },
    { label: "Khách hàng",   href: "/customers",   icon: "👥" },
    { label: "Thanh toán",   href: "/payments",    icon: "💳" },
    { label: "Nhân viên",    href: "/employees",   icon: "👤" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-900 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-zinc-800">
                <h1 className="text-white font-semibold text-lg">🏖️ Resort</h1>
                <p className="text-zinc-400 text-xs mt-0.5">Management System</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {MENU.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                                ${isActive
                                    ? "bg-white text-zinc-900 font-medium"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                }`}>
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-zinc-800">
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white w-full transition-colors">
                    <span>🚪</span>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
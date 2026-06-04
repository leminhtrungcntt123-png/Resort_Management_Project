// frontend/src/app/(management)/layout.tsx
"use client"; // Thêm dòng này nếu các Provider hoặc Component của bạn cần chạy ở Client-side

import { LangProvider } from "@/contexts/LangContext";
import Sidebar from "@/components/Sidebar";
import ChatWidget from "@/components/ChatWidget";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ManagementLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LangProvider>
            <div className="flex min-h-screen">
                {/* 1. SIDEBAR BÊN TRÁI */}
                <Sidebar />

                {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
                <div className="flex-1 ml-56 flex flex-col min-h-screen">
                    {/* THANH HEADER TRÊN CÙNG */}
                    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                                Resort Operating System
                            </p>
                        </div>

                        {/* Nơi hiển thị bộ chuyển ngôn ngữ */}
                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                        </div>
                    </header>

                    {/* NỘI DUNG THAY ĐỔI CỦA TỪNG TRANG QUẢN TRỊ */}
                    <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
                        {children}
                    </main>
                </div>
            </div>

            {/* Nút chat nổi lên trên toàn bộ các trang quản trị */}
            <ChatWidget />
        </LangProvider>
    );
}
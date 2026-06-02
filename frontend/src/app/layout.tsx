import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/contexts/LangContext";
import Sidebar from "@/components/Sidebar";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
// Thử tìm xem LanguageSwitcher của bạn nằm ở đâu để import vào, ví dụ:
import LanguageSwitcher from "@/components/LanguageSwitcher";

const geist = Geist({
    subsets: ['latin'],
    variable: '--font-sans'
});

export const metadata: Metadata = {
    title: "Resort Management System",
    description: "Hệ thống quản lý Resort cao cấp",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi" className={cn("font-sans antialiased selection:bg-zinc-200", geist.variable)} suppressHydrationWarning>
            <body className="min-h-screen bg-zinc-50/60 text-zinc-900">
                <LangProvider>
                    <div className="flex min-h-screen">

                        {/* 1. SIDEBAR BÊN TRÁI (Giữ nguyên component của bạn) */}
                        <Sidebar />

                        {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
                        {/* ml-56 tương ứng với chiều rộng Sidebar của bạn */}
                        <div className="flex-1 ml-56 flex flex-col min-h-screen">

                            {/* THANH HEADER TRÊN CÙNG MỚI ĐƯỢC THÊM VÀO */}
                            <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                                        Resort Operating System
                                    </p>
                                </div>

                                {/* Nơi hiển thị bộ chuyển ngôn ngữ của bạn */}
                                <div className="flex items-center gap-4">
                                    <LanguageSwitcher />
                                </div>
                            </header>

                            {/* NỘI DUNG THAY ĐỔI CỦA TỪNG TRANG */}
                            <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
                                {children}
                            </main>

                        </div>
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
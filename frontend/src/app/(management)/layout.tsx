// frontend/src/app/(management)/layout.tsx
"use client"; // Thêm dòng này nếu các Provider hoặc Component của bạn cần chạy ở Client-side

import { LangProvider } from "@/contexts/LangContext";
import Sidebar from "@/components/Sidebar";
import ChatWidget from "@/components/ChatWidget";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LangProvider>
      <AuthProvider>
        <div className="flex min-h-screen">
          {/* 1. SIDEBAR BÊN TRÁI */}
          <Sidebar />

          {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI */}
          <div className="flex-1 ml-56 flex flex-col min-h-screen">
            {/* THANH HEADER TRÊN CÙNG */}
            <Header />

            {/* NỘI DUNG THAY ĐỔI CỦA TỪNG TRANG QUẢN TRỊ */}
            <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Nút chat nổi lên trên toàn bộ các trang quản trị */}
        <ChatWidget />
      </AuthProvider>
    </LangProvider>
  );
}

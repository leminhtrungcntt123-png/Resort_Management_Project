import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/contexts/LangContext";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
    title: "Resort Management System",
    description: "Hệ thống quản lý Resort",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                <LangProvider>
                    <div className="flex min-h-screen bg-zinc-50">
                        <Sidebar />
                        {/* Main content — offset left bằng width sidebar */}
                        <div className="flex-1 ml-56">
                            {children}
                        </div>
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
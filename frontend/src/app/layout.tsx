// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

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
                {/* Chỉ trả về children để trang login không bị dính sidebar */}
                {children}
            </body>
        </html>
    );
}
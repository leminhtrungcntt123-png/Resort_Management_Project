"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bed,
  CalendarDays,
  Users,
  CreditCard,
  UserSquare2,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_GROUPS = [
  {
    groupLabel: "Tổng quan",
    items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    groupLabel: "Quản lý vận hành",
    items: [
      { label: "Sơ đồ phòng", href: "/rooms", icon: Bed },
      { label: "Đặt phòng", href: "/bookings", icon: CalendarDays },
      { label: "Khách hàng", href: "/customers", icon: Users },
    ],
  },
  {
    groupLabel: "Nhân sự & Tài chính",
    items: [
      { label: "Thanh toán", href: "/payments", icon: CreditCard },
      { label: "Nhân viên", href: "/employees", icon: UserSquare2 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-56 bg-zinc-950 flex flex-col border-r border-zinc-900 shadow-2xl select-none">
      {/* 1. LOGO TRÊN CÙNG (Làm sáng và rõ nét hơn) */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-zinc-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-lg shadow-white/5">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-zinc-50 font-bold text-base tracking-tight">
            Resort CMS
          </h1>
          <p className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold mt-0.5">
            Management
          </p>
        </div>
      </div>

      {/* 2. HỆ THỐNG MENU CHIA CỤM */}
      <div className="flex-1 px-3 py-6 flex flex-col gap-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {MENU_GROUPS.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            {/* Nhãn nhóm: Đưa từ zinc-600 lên zinc-400 để hết mờ, tăng tracking cho thoáng */}
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400/80">
              {group.groupLabel}
            </p>

            <nav className="flex flex-col gap-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "bg-white text-zinc-950 shadow-md font-semibold"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-white",
                    )}
                  >
                    {/* Icon: Tăng kích thước lên h-5 w-5 và nâng tông màu sáng lên */}
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-zinc-950"
                          : "text-zinc-400 group-hover:text-zinc-100",
                      )}
                    />

                    <span className="truncate">{item.label}</span>

                    {/* Vạch chỉ thị Active tinh tế bằng thanh dọc ở rìa trái hoặc chấm tròn ở rìa phải */}
                    {isActive && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-zinc-950" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

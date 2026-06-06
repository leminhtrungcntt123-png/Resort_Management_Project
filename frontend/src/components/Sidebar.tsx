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
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext"; // Import hook quản lý ngôn ngữ

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const { t } = useLang(); // Lấy đối tượng dịch t từ Context

  // Cấu trúc danh mục Menu được cập nhật ngôn ngữ động theo file locale
  const MENU_GROUPS = [
    {
      groupLabel: t?.sidebar?.overview || "Tổng quan",
      items: [
        {
          label: t?.sidebar?.dashboard || "Dashboard",
          href: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: t?.sidebar?.operation || "Quản lý vận hành",
      items: [
        {
          label: t?.sidebar?.rooms || "Sơ đồ phòng",
          href: "/rooms",
          icon: Bed,
        },
        {
          label: t?.sidebar?.bookings || "Đặt phòng",
          href: "/bookings",
          icon: CalendarDays,
        },
        {
          label: t?.sidebar?.customers || "Khách hàng",
          href: "/customers",
          icon: Users,
        },
      ],
    },
    {
      groupLabel: t?.sidebar?.hrFinance || "Nhân sự & Tài chính",
      items: [
        {
          label: t?.sidebar?.payments || "Thanh toán",
          href: "/payments",
          icon: CreditCard,
        },
        {
          label: t?.sidebar?.employees || "Nhân viên",
          href: "/employees",
          icon: UserSquare2,
          allowedRoles: ["ADMIN"] as UserRole[],
        },
        
        {
          label: t?.sidebar?.users || "Tài khoản",
          href: "/users",
          icon: ShieldCheck,
          allowedRoles: ["ADMIN"] as UserRole[],
        },
      ],
    },
  ];

  return (
    <aside
      className="fixed left-0 top-0 z-50 h-screen w-56 bg-zinc-950
                      flex flex-col border-r border-zinc-900 shadow-2xl select-none"
    >
      {/* Logo vùng phía trên */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-zinc-900">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl
                        bg-white text-zinc-950 shadow-lg shadow-white/5"
        >
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

      {/* Vùng Menu các chức năng */}
      <div
        className="flex-1 px-3 py-6 flex flex-col gap-6 overflow-y-auto
                      [scrollbar-width:none] [-ms-overflow-style:none]
                      [&::-webkit-scrollbar]:hidden"
      >
        {MENU_GROUPS.map((group, idx) => {
          // Lọc danh sách menu hiển thị dựa trên vai trò (Role) người dùng
          const visibleItems = group.items.filter((item) => {
            if (!item.allowedRoles) return true;
            return item.allowedRoles.includes(role);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="flex flex-col gap-2">
              <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400/80">
                {group.groupLabel}
              </p>
              <nav className="flex flex-col gap-1">
                {visibleItems.map((item) => {
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
                      <Icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-zinc-950"
                            : "text-zinc-400 group-hover:text-zinc-100",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span
                          className="absolute right-3.5 top-1/2 -translate-y-1/2
                                         h-2 w-2 rounded-full bg-zinc-950"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getJwtPayload, formatRole } from "@/lib/auth";

// Định nghĩa các role
export type UserRole = "ADMIN" | "MANAGER" | "RECEPTIONIST" | null;

interface AuthContextType {
  username: string;
  role: UserRole;
  formattedRole: string; // "Admin" / "Manager" / "Receptionist"
  isAdmin: boolean; // Shortcut kiểm tra nhanh
  isManager: boolean;
  isReceptionist: boolean;
  canEdit: boolean; // ADMIN + MANAGER được sửa
  canDelete: boolean; // chỉ ADMIN được xóa
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    // Decode JWT 1 lần duy nhất khi app khởi động
    const payload = getJwtPayload();
    if (payload) {
      setUsername(payload.sub);
      setRole(payload.role as UserRole);
    }
  }, []);

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isReceptionist = role === "RECEPTIONIST";

  return (
    <AuthContext.Provider
      value={{
        username,
        role,
        formattedRole: role ? formatRole(role) : "",
        isAdmin,
        isManager,
        isReceptionist,
        canEdit: isAdmin || isManager, // ADMIN + MANAGER
        canDelete: isAdmin, // chỉ ADMIN
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng trong AuthProvider");
  return ctx;
}

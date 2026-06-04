export interface JwtPayload {
  sub: string; // username
  role: string; // ROLE_ADMIN / ROLE_MANAGER / ROLE_RECEPTIONIST
  exp: number;
}

export function getJwtPayload(): JwtPayload | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

export function formatRole(role: string): string {
  // Xử lý cả 2 trường hợp: "ADMIN" và "ROLE_ADMIN"
  const clean = role.replace("ROLE_", "");
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

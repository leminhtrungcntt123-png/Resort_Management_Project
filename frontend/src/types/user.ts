export interface User {
    id: number;
    username: string;
    role: string;
    isActive: boolean;
    employeeName: string | null;
}

export interface UserListResponse {
    success: boolean;
    data: User[];
}
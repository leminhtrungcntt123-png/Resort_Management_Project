export interface Payment {
    id: number;
    bookingId: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentDate: string | null;
    createdAt: string;
}

export interface PaymentPageData {
    content: Payment[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export interface RevenueItem {
    period: string;
    revenue: number;
}
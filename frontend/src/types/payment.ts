import { BookingDetail } from "./booking";

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  discountAmount: number; // ← thêm vào đây
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string | null;
  createdAt: string;
  bookingDetail?: BookingDetail;
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

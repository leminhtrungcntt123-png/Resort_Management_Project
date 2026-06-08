export interface BookingCustomer {
  id: number;
  fullName: string;
  phone: string;
  email: string;
}

export interface BookingRoom {
  roomId: number;
  roomNumber: string;
  floorNumber: number;
  roomTypeName: string;
  priceSnapshot: number;
}

export interface BookingService {
  serviceId: number;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  priceOverride: number | null; // ← thêm
  bookedAt: string | null;
}

export interface BookingPayment {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string | null;
}

export interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  createdAt: string;
  customer: BookingCustomer;
  rooms: BookingRoom[];
  services: BookingService[];
  payment: BookingPayment;
  totalAmount?: number;
}

export interface BookingPageData {
  content: Booking[];
  page: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface BookingDetail {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  createdAt: string;
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email: string;
  };
  rooms: {
    roomId: number;
    roomNumber: string;
    floorNumber: number;
    roomTypeName: string;
    priceSnapshot: number;
  }[];
  services: {
    serviceId: number;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    priceOverride: number | null; // ← thêm
    bookedAt: string | null;
  }[];
  payment: {
    id: number;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentDate: string | null;
  } | null;
}

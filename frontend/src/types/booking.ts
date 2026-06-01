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
}

export interface BookingPageData {
    content: Booking[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}
export interface Customer {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    loyaltyPoints: number;
    createdAt: string;
}

export interface CustomerPageData {
    content: Customer[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export interface CustomerForm {
    fullName: string;
    phone: string;
    email: string;
}
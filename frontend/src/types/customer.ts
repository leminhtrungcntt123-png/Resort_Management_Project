export interface Customer {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    totalSpent: number;
    vipTier: 'VIP_0' | 'VIP_1' | 'VIP_2' | 'VIP_3' | 'VIP_4' | 'VIP_5';
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
export interface Service {
    id: number;
    serviceName: string;
    price: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServicePageData {
    content: Service[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}
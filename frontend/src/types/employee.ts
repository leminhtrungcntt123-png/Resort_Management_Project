export interface Employee {
    id: number;
    fullName: string;
    phone: string;
    email: string;
    position: string;
    salary: number;
}

export interface EmployeePageData {
    content: Employee[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export interface EmployeeForm {
    fullName: string;
    phone: string;
    email: string;
    position: string;
    salary: number;
}
export interface Room {
    id: number;
    roomNumber: string;
    floorNumber: number;
    status: string;
    roomType: {
        id: number;
        typeName: string;
        pricePerNight: number;
        capacity: number;
    };
}

export interface PageData {
    content: Room[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

export interface RoomType {
    id: number;
    typeName: string;
}

export interface RoomForm {
    roomNumber: string;
    floorNumber: number;
    status: string;
    roomTypeId: number;
}
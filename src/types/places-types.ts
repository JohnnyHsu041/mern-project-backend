export interface Coordinates {
    lat: number;
    lng: number;
}

export interface BasicPlaceInfo {
    title: string;
    description: string;
    address: string;
    creator: string;
}

export interface Place extends BasicPlaceInfo {
    id: string;
    title: string;
    description: string;
    location: Coordinates;
    address: string;
    creator: string;
}

export interface BasicUserInfo {
    name: string;
    email: string;
    password: string;
    places: string;
}

export interface User extends BasicUserInfo {
    name: string;
    email: string;
    password: string;
    image: string;
    places: string;
}

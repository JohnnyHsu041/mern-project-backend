export interface BasicUserInfo {
    name: string;
    email: string;
    password: string;
}

export interface User extends BasicUserInfo {
    id: string;
    name: string;
    email: string;
    password: string;
}

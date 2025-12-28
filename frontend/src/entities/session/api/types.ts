export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    address?: string;
}

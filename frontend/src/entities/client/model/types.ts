export interface Client {
    id: number;
    user_id: number;
    full_name: string;
    phone_number: string;
    address?: string;
}

export interface ClientCreate {
    email: string;
    password: string;
    full_name: string;
    phone_number: string;
    address?: string;
}

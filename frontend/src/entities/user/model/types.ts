export const UserRole = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    CLIENT: 'client',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    phone_number?: string;
    address?: string;
}

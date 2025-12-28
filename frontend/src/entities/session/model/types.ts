import type { User } from '../../user/model/types';

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface SessionState {
    user: User | null;
    isAuthenticated: boolean;
    checkAuth: () => Promise<void>;
    logout: () => void;
}

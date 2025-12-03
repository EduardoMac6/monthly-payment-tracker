/**
 * Auth Service (Frontend)
 * Handles authentication in the frontend
 */

const AUTH_TOKEN_KEY = 'debtLiteAuthToken';
const AUTH_USER_KEY = 'debtLiteAuthUser';

export interface AuthUser {
    id: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse {
    user: AuthUser;
    token: string;
}

export class AuthService {
    /**
     * Get stored auth token
     */
    getToken(): string | null {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }
        return window.localStorage.getItem(AUTH_TOKEN_KEY);
    }

    /**
     * Get stored user
     */
    getUser(): AuthUser | null {
        if (typeof window === 'undefined' || !window.localStorage) {
            return null;
        }
        const userJson = window.localStorage.getItem(AUTH_USER_KEY);
        if (!userJson) {
            return null;
        }
        try {
            return JSON.parse(userJson) as AuthUser;
        } catch {
            return null;
        }
    }

    /**
     * Store auth data
     */
    setAuth(data: AuthResponse): void {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }

    /**
     * Clear auth data
     */
    clearAuth(): void {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        window.localStorage.removeItem(AUTH_USER_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}

export const authService = new AuthService();

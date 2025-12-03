/**
 * Auth Types
 * Type definitions for authentication
 */

export interface RegisterInput {
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface TokenPayload {
    userId: string;
    email: string;
}


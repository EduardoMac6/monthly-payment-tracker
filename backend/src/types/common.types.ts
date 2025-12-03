/**
 * Common Types
 * Shared type definitions used across the application
 */

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}


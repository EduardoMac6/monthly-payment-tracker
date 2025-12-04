import type { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './localStorage.service.js';
import { ApiStorageService } from './api.service.js';
import { SupabaseStorageService } from './supabase.service.js';
import { getStorageType } from '../../config/storage.config.js';
import { getApiUrl, getSupabaseUrl, getSupabaseAnonKey } from '../../config/env.config.js';

/**
 * Storage Factory
 * Creates the appropriate storage service instance based on configuration
 */
export class StorageFactory {
    private static instance: IStorageService | null = null;

    /**
     * Create or get the storage service instance
     * @returns Storage service instance
     */
    static create(): IStorageService {
        // Use singleton pattern to ensure only one instance exists
        if (this.instance) {
            return this.instance;
        }

        const storageType = getStorageType();

        switch (storageType) {
            case 'localStorage':
                this.instance = new LocalStorageService();
                break;
            case 'api': {
                const apiUrl = getApiUrl();
                if (!apiUrl) {
                    throw new Error(
                        'API storage requires VITE_API_URL to be configured. Please set it in your environment variables.'
                    );
                }
                this.instance = new ApiStorageService(apiUrl);
                break;
            }
            case 'supabase': {
                const supabaseUrl = getSupabaseUrl();
                const supabaseAnonKey = getSupabaseAnonKey();
                if (!supabaseUrl || !supabaseAnonKey) {
                    throw new Error(
                        'Supabase storage requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be configured. Please set them in your environment variables.'
                    );
                }
                this.instance = new SupabaseStorageService();
                break;
            }
            default:
                throw new Error(`Unknown storage type: ${storageType}`);
        }

        return this.instance;
    }

    /**
     * Reset the singleton instance (useful for testing)
     */
    static reset(): void {
        this.instance = null;
    }
}

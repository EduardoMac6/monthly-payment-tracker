import type { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './localStorage.service.js';
import { getStorageType } from '../../config/storage.config.js';

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
            case 'api':
                // Future: return new ApiStorageService();
                throw new Error('API storage not yet implemented. Please use localStorage.');
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


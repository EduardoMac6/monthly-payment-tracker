/**
 * Storage configuration
 * Determines which storage service to use
 */

export type StorageType = 'localStorage' | 'api';

/**
 * Get storage type from environment or default to localStorage
 * In the future, this can read from environment variables
 */
export function getStorageType(): StorageType {
    // For now, always use localStorage
    // In the future: return (process.env.VITE_STORAGE_TYPE as StorageType) || 'localStorage';
    return 'localStorage';
}


/**
 * Storage configuration
 * Determines which storage service to use
 */

import { getEnvStorageType } from './env.config.js';

export type StorageType = 'localStorage' | 'api';

/**
 * Get storage type from environment or default to localStorage
 * Reads from environment configuration
 */
export function getStorageType(): StorageType {
    return getEnvStorageType();
}


/**
 * Sync Service
 * Handles offline/online synchronization for API operations
 * Queues operations when offline and syncs when connection is restored
 */

import type { IStorageService } from '../storage/storage.interface.js';
import { ErrorHandler } from '../../utils/errors.js';

/**
 * Queued operation type
 */
interface QueuedOperation {
    id: string;
    type: 'savePlan' | 'savePlans' | 'deletePlan' | 'savePaymentStatus' | 'savePaymentTotals';
    data: unknown;
    timestamp: number;
    retries: number;
}

/**
 * Connection status
 */
export type ConnectionStatus = 'online' | 'offline' | 'checking';

/**
 * Sync Service
 * Manages offline queue and synchronization
 */
export class SyncService {
    private static readonly QUEUE_KEY = 'debtLiteSyncQueue';
    private static readonly MAX_RETRIES = 3;
    private static readonly MAX_QUEUE_SIZE = 100;

    private storage: IStorageService;
    private isOnline: boolean;
    private statusListeners: Set<(status: ConnectionStatus) => void>;
    private syncInProgress: boolean;

    constructor(storage: IStorageService) {
        this.storage = storage;
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.statusListeners = new Set();
        this.syncInProgress = false;

        this.initializeConnectionListeners();
    }

    /**
     * Initialize connection status listeners
     */
    private initializeConnectionListeners(): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }

    /**
     * Handle online event
     */
    private async handleOnline(): Promise<void> {
        this.isOnline = true;
        this.notifyStatusListeners('online');
        await this.syncQueue();
    }

    /**
     * Handle offline event
     */
    private handleOffline(): void {
        this.isOnline = false;
        this.notifyStatusListeners('offline');
    }

    /**
     * Get current connection status
     */
    getConnectionStatus(): ConnectionStatus {
        if (this.syncInProgress) {
            return 'checking';
        }
        return this.isOnline ? 'online' : 'offline';
    }

    /**
     * Check if currently online
     */
    isCurrentlyOnline(): boolean {
        return this.isOnline;
    }

    /**
     * Add status listener
     */
    addStatusListener(listener: (status: ConnectionStatus) => void): void {
        this.statusListeners.add(listener);
    }

    /**
     * Remove status listener
     */
    removeStatusListener(listener: (status: ConnectionStatus) => void): void {
        this.statusListeners.delete(listener);
    }

    /**
     * Notify all status listeners
     */
    private notifyStatusListeners(status: ConnectionStatus): void {
        this.statusListeners.forEach((listener) => {
            try {
                listener(status);
            } catch (error) {
                ErrorHandler.logError(
                    error instanceof Error ? error : new Error('Unknown error'),
                    'SyncService.notifyStatusListeners'
                );
            }
        });
    }

    /**
     * Get queued operations from localStorage
     */
    private getQueue(): QueuedOperation[] {
        if (typeof window === 'undefined' || !window.localStorage) {
            return [];
        }

        try {
            const queueJson = window.localStorage.getItem(SyncService.QUEUE_KEY);
            if (!queueJson) {
                return [];
            }
            return JSON.parse(queueJson) as QueuedOperation[];
        } catch (error) {
            ErrorHandler.logError(
                error instanceof Error ? error : new Error('Unknown error'),
                'SyncService.getQueue'
            );
            return [];
        }
    }

    /**
     * Save queued operations to localStorage
     */
    private saveQueue(queue: QueuedOperation[]): void {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        try {
            // Limit queue size to prevent localStorage overflow
            const limitedQueue = queue.slice(-SyncService.MAX_QUEUE_SIZE);
            window.localStorage.setItem(SyncService.QUEUE_KEY, JSON.stringify(limitedQueue));
        } catch (error) {
            ErrorHandler.logError(
                error instanceof Error ? error : new Error('Unknown error'),
                'SyncService.saveQueue'
            );
        }
    }

    /**
     * Add operation to queue
     */
    private queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>): void {
        const queue = this.getQueue();

        const queuedOperation: QueuedOperation = {
            ...operation,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retries: 0,
        };

        queue.push(queuedOperation);
        this.saveQueue(queue);
    }

    /**
     * Remove operation from queue
     */
    private removeFromQueue(operationId: string): void {
        const queue = this.getQueue();
        const filteredQueue = queue.filter((op) => op.id !== operationId);
        this.saveQueue(filteredQueue);
    }

    /**
     * Execute queued operation
     */
    private async executeOperation(operation: QueuedOperation): Promise<boolean> {
        try {
            switch (operation.type) {
                case 'savePlan':
                    await this.storage.savePlan(
                        operation.data as Parameters<typeof this.storage.savePlan>[0]
                    );
                    break;
                case 'savePlans':
                    await this.storage.savePlans(
                        operation.data as Parameters<typeof this.storage.savePlans>[0]
                    );
                    break;
                case 'deletePlan':
                    await this.storage.deletePlan(operation.data as string);
                    break;
                case 'savePaymentStatus': {
                    const [planId, status] = operation.data as [string, unknown];
                    await this.storage.savePaymentStatus(
                        planId,
                        status as Parameters<typeof this.storage.savePaymentStatus>[1]
                    );
                    break;
                }
                case 'savePaymentTotals': {
                    const [planId, totals] = operation.data as [string, unknown];
                    await this.storage.savePaymentTotals(
                        planId,
                        totals as Parameters<typeof this.storage.savePaymentTotals>[1]
                    );
                    break;
                }
                default:
                    console.warn(`Unknown operation type: ${(operation as QueuedOperation).type}`);
                    return false;
            }
            return true;
        } catch (error) {
            ErrorHandler.logError(
                error instanceof Error ? error : new Error('Unknown error'),
                `SyncService.executeOperation.${operation.type}`
            );
            return false;
        }
    }

    /**
     * Sync queued operations
     */
    async syncQueue(): Promise<void> {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        this.notifyStatusListeners('checking');

        try {
            const queue = this.getQueue();
            if (queue.length === 0) {
                this.syncInProgress = false;
                this.notifyStatusListeners('online');
                return;
            }

            const failedOperations: QueuedOperation[] = [];

            for (const operation of queue) {
                const success = await this.executeOperation(operation);

                if (success) {
                    this.removeFromQueue(operation.id);
                } else {
                    operation.retries += 1;
                    if (operation.retries < SyncService.MAX_RETRIES) {
                        failedOperations.push(operation);
                    } else {
                        // Max retries reached, remove from queue
                        this.removeFromQueue(operation.id);
                        ErrorHandler.logError(
                            new Error(
                                `Operation ${operation.type} failed after ${SyncService.MAX_RETRIES} retries`
                            ),
                            'SyncService.syncQueue'
                        );
                    }
                }
            }

            // Update queue with failed operations that can be retried
            if (failedOperations.length > 0) {
                const currentQueue = this.getQueue();
                const updatedQueue = currentQueue.map((op) => {
                    const failed = failedOperations.find((f) => f.id === op.id);
                    return failed || op;
                });
                this.saveQueue(updatedQueue);
            }
        } catch (error) {
            ErrorHandler.logError(
                error instanceof Error ? error : new Error('Unknown error'),
                'SyncService.syncQueue'
            );
        } finally {
            this.syncInProgress = false;
            this.notifyStatusListeners(this.isOnline ? 'online' : 'offline');
        }
    }

    /**
     * Execute operation with offline queue support
     */
    async executeWithSync<T>(
        operation: () => Promise<T>,
        queueData: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries'>
    ): Promise<T> {
        if (this.isOnline) {
            try {
                return await operation();
            } catch (error) {
                // If operation fails and we're online, queue it for retry
                if (error instanceof Error && this.isNetworkError(error)) {
                    this.queueOperation(queueData);
                    throw error;
                }
                throw error;
            }
        } else {
            // Offline: queue the operation
            this.queueOperation(queueData);
            throw new Error('Operation queued for sync when connection is restored');
        }
    }

    /**
     * Check if error is network-related
     */
    private isNetworkError(error: Error): boolean {
        return (
            error.message.includes('Network') ||
            error.message.includes('fetch') ||
            error.message.includes('Failed to fetch') ||
            error.name === 'TypeError'
        );
    }

    /**
     * Get queue size
     */
    getQueueSize(): number {
        return this.getQueue().length;
    }

    /**
     * Clear sync queue
     */
    clearQueue(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(SyncService.QUEUE_KEY);
        }
    }
}

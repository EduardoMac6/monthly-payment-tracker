/**
 * Sync Service Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SyncService } from './sync.service.js';
import type { IStorageService } from '../storage/storage.interface.js';
import type { Plan } from '../../types/index.js';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: () => {
            store = {};
        },
    };
})();

// Mock ErrorHandler
vi.mock('../../utils/errors.js', async () => {
    const actual = await vi.importActual('../../utils/errors.js');
    return {
        ...actual,
        ErrorHandler: {
            logError: vi.fn(),
        },
    };
});

describe('SyncService', () => {
    let mockStorage: IStorageService;
    let syncService: SyncService;

    beforeEach(() => {
        // Reset localStorage mock
        localStorageMock.clear();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            writable: true,
            value: true,
        });

        // Create mock storage
        mockStorage = {
            getPlans: vi.fn().mockResolvedValue([]),
            savePlan: vi.fn().mockResolvedValue(undefined),
            savePlans: vi.fn().mockResolvedValue(undefined),
            deletePlan: vi.fn().mockResolvedValue(undefined),
            getActivePlanId: vi.fn().mockResolvedValue(null),
            setActivePlanId: vi.fn().mockResolvedValue(undefined),
            getActivePlan: vi.fn().mockResolvedValue(null),
            getPaymentStatus: vi.fn().mockResolvedValue([]),
            savePaymentStatus: vi.fn().mockResolvedValue(undefined),
            getPaymentTotals: vi.fn().mockResolvedValue(null),
            savePaymentTotals: vi.fn().mockResolvedValue(undefined),
            deletePaymentData: vi.fn().mockResolvedValue(undefined),
            clearActivePlanId: vi.fn().mockResolvedValue(undefined),
        };

        syncService = new SyncService(mockStorage);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create sync service', () => {
            expect(syncService).toBeInstanceOf(SyncService);
        });

        it('should initialize with online status', () => {
            expect(syncService.isCurrentlyOnline()).toBe(true);
            expect(syncService.getConnectionStatus()).toBe('online');
        });
    });

    describe('connection status', () => {
        it('should detect online status', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true,
            });

            const newService = new SyncService(mockStorage);
            expect(newService.isCurrentlyOnline()).toBe(true);
            expect(newService.getConnectionStatus()).toBe('online');
        });

        it('should detect offline status', () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            const newService = new SyncService(mockStorage);
            expect(newService.isCurrentlyOnline()).toBe(false);
            expect(newService.getConnectionStatus()).toBe('offline');
        });

        it('should show checking status during sync', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            // Queue an operation
            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    {
                        id: '1',
                        type: 'savePlan',
                        data: plan,
                        timestamp: Date.now(),
                        retries: 0,
                    },
                ])
            );

            // Start sync (will be in progress)
            const syncPromise = syncService.syncQueue();
            expect(syncService.getConnectionStatus()).toBe('checking');

            await syncPromise;
            expect(syncService.getConnectionStatus()).toBe('online');
        });
    });

    describe('status listeners', () => {
        it('should notify listeners on status change', () => {
            const listener = vi.fn();
            syncService.addStatusListener(listener);

            // Trigger offline event
            window.dispatchEvent(new Event('offline'));

            expect(listener).toHaveBeenCalledWith('offline');
        });

        it('should remove listeners', () => {
            const listener = vi.fn();
            syncService.addStatusListener(listener);
            syncService.removeStatusListener(listener);

            window.dispatchEvent(new Event('offline'));

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe('queue operations', () => {
        it('should queue operation when offline', async () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            const newService = new SyncService(mockStorage);
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            await expect(
                newService.executeWithSync(() => mockStorage.savePlan(plan), {
                    type: 'savePlan',
                    data: plan,
                })
            ).rejects.toThrow('Operation queued for sync');

            const queue = JSON.parse(localStorageMock.getItem('debtLiteSyncQueue') || '[]');
            expect(queue.length).toBe(1);
            expect(queue[0].type).toBe('savePlan');
        });

        it('should execute operation immediately when online', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            await syncService.executeWithSync(() => mockStorage.savePlan(plan), {
                type: 'savePlan',
                data: plan,
            });

            expect(mockStorage.savePlan).toHaveBeenCalledWith(plan);
        });

        it('should queue operation on network error', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            const networkError = new TypeError('Failed to fetch');
            (mockStorage.savePlan as any).mockRejectedValueOnce(networkError);

            await expect(
                syncService.executeWithSync(() => mockStorage.savePlan(plan), {
                    type: 'savePlan',
                    data: plan,
                })
            ).rejects.toThrow();

            const queue = JSON.parse(localStorageMock.getItem('debtLiteSyncQueue') || '[]');
            expect(queue.length).toBe(1);
        });
    });

    describe('syncQueue', () => {
        it('should sync queued operations when online', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    {
                        id: '1',
                        type: 'savePlan',
                        data: plan,
                        timestamp: Date.now(),
                        retries: 0,
                    },
                ])
            );

            await syncService.syncQueue();

            expect(mockStorage.savePlan).toHaveBeenCalledWith(plan);
            const queue = JSON.parse(localStorageMock.getItem('debtLiteSyncQueue') || '[]');
            expect(queue.length).toBe(0);
        });

        it('should not sync when offline', async () => {
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            const newService = new SyncService(mockStorage);
            await newService.syncQueue();

            expect(mockStorage.savePlan).not.toHaveBeenCalled();
        });

        it('should retry failed operations', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    {
                        id: '1',
                        type: 'savePlan',
                        data: plan,
                        timestamp: Date.now(),
                        retries: 0,
                    },
                ])
            );

            // First call fails, second succeeds
            (mockStorage.savePlan as any)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce(undefined);

            await syncService.syncQueue();

            // Operation should still be in queue with retry count
            const queue = JSON.parse(localStorageMock.getItem('debtLiteSyncQueue') || '[]');
            expect(queue.length).toBe(1);
            expect(queue[0].retries).toBe(1);
        });

        it('should remove operations after max retries', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    {
                        id: '1',
                        type: 'savePlan',
                        data: plan,
                        timestamp: Date.now(),
                        retries: 3, // Max retries reached
                    },
                ])
            );

            (mockStorage.savePlan as any).mockRejectedValue(new Error('Network error'));

            await syncService.syncQueue();

            const queue = JSON.parse(localStorageMock.getItem('debtLiteSyncQueue') || '[]');
            expect(queue.length).toBe(0);
        });
    });

    describe('getQueueSize', () => {
        it('should return queue size', () => {
            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    { id: '1', type: 'savePlan', data: {}, timestamp: Date.now(), retries: 0 },
                    { id: '2', type: 'savePlan', data: {}, timestamp: Date.now(), retries: 0 },
                ])
            );

            expect(syncService.getQueueSize()).toBe(2);
        });

        it('should return 0 when queue is empty', () => {
            expect(syncService.getQueueSize()).toBe(0);
        });
    });

    describe('clearQueue', () => {
        it('should clear sync queue', () => {
            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    { id: '1', type: 'savePlan', data: {}, timestamp: Date.now(), retries: 0 },
                ])
            );

            syncService.clearQueue();

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('debtLiteSyncQueue');
        });
    });

    describe('event handlers', () => {
        it('should handle online event', async () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                createdAt: '2024-01-01',
                isActive: true,
            };

            localStorageMock.setItem(
                'debtLiteSyncQueue',
                JSON.stringify([
                    {
                        id: '1',
                        type: 'savePlan',
                        data: plan,
                        timestamp: Date.now(),
                        retries: 0,
                    },
                ])
            );

            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            const newService = new SyncService(mockStorage);
            expect(newService.isCurrentlyOnline()).toBe(false);

            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: true,
            });

            window.dispatchEvent(new Event('online'));

            // Wait for async sync
            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(mockStorage.savePlan).toHaveBeenCalled();
        });

        it('should handle offline event', () => {
            const listener = vi.fn();
            syncService.addStatusListener(listener);

            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false,
            });

            window.dispatchEvent(new Event('offline'));

            expect(listener).toHaveBeenCalledWith('offline');
            expect(syncService.isCurrentlyOnline()).toBe(false);
        });
    });
});

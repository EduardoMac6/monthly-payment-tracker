import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from './localStorage.service.js';
import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types/index.js';
import { StorageError } from '../../utils/errors.js';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

// Mock ErrorHandler to avoid console errors in tests
vi.mock('../../utils/errors.js', async () => {
    const actual = await vi.importActual('../../utils/errors.js');
    return {
        ...actual,
        ErrorHandler: {
            logError: vi.fn(),
        },
    };
});

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let mockPlans: Plan[];

    beforeEach(() => {
        // Reset localStorage mock
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true,
        });
        localStorageMock.clear();

        service = new LocalStorageService();

        mockPlans = [
            {
                id: '1',
                planName: 'Test Plan 1',
                totalAmount: 12000,
                numberOfMonths: 12,
                monthlyPayment: 1000,
                debtOwner: 'self',
                createdAt: '2024-01-01T00:00:00.000Z',
                isActive: true,
            },
            {
                id: '2',
                planName: 'Test Plan 2',
                totalAmount: 5000,
                numberOfMonths: 5,
                monthlyPayment: 1000,
                debtOwner: 'other',
                createdAt: '2024-01-02T00:00:00.000Z',
                isActive: false,
            },
        ];
    });

    describe('getPlans', () => {
        it('should return empty array when no plans exist', async () => {
            const plans = await service.getPlans();
            expect(plans).toEqual([]);
        });

        it('should return plans from localStorage', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            const plans = await service.getPlans();
            expect(plans).toEqual(mockPlans);
        });

        it('should throw StorageError for corrupted JSON', async () => {
            localStorage.setItem('debtLitePlans', 'invalid json');
            await expect(service.getPlans()).rejects.toThrow(StorageError);
        });
    });

    describe('savePlan', () => {
        it('should save a new plan', async () => {
            const newPlan: Plan = {
                id: '3',
                planName: 'New Plan',
                totalAmount: 3000,
                numberOfMonths: 3,
                monthlyPayment: 1000,
                createdAt: '2024-01-03T00:00:00.000Z',
                isActive: false,
            };

            await service.savePlan(newPlan);
            const plans = await service.getPlans();
            expect(plans).toHaveLength(1);
            expect(plans[0]).toEqual(newPlan);
        });

        it('should update existing plan', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            const updatedPlan = { ...mockPlans[0], planName: 'Updated Plan' };

            await service.savePlan(updatedPlan);
            const plans = await service.getPlans();
            expect(plans[0].planName).toBe('Updated Plan');
            expect(plans).toHaveLength(2);
        });
    });

    describe('savePlans', () => {
        it('should save multiple plans', async () => {
            await service.savePlans(mockPlans);
            const plans = await service.getPlans();
            expect(plans).toEqual(mockPlans);
        });

        it('should throw StorageError on quota exceeded', async () => {
            // Mock quota exceeded error
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = vi.fn(() => {
                const error = new DOMException('Quota exceeded', 'QuotaExceededError');
                throw error;
            });

            await expect(service.savePlans(mockPlans)).rejects.toThrow(StorageError);

            localStorage.setItem = originalSetItem;
        });
    });

    describe('deletePlan', () => {
        it('should delete a plan by ID', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            await service.deletePlan('1');

            const plans = await service.getPlans();
            expect(plans).toHaveLength(1);
            expect(plans[0].id).toBe('2');
        });

        it('should throw error when plan not found', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            await expect(service.deletePlan('999')).rejects.toThrow('not found');
        });

        it('should delete payment data when deleting plan', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            localStorage.setItem('paymentStatus_1', JSON.stringify(['paid']));
            localStorage.setItem('paymentTotals_1', JSON.stringify({ totalPaid: 1000, remaining: 11000 }));

            await service.deletePlan('1');

            expect(localStorage.getItem('paymentStatus_1')).toBeNull();
            expect(localStorage.getItem('paymentTotals_1')).toBeNull();
        });
    });

    describe('getActivePlanId', () => {
        it('should return active plan ID', async () => {
            localStorage.setItem('debtLiteActivePlanId', '1');
            const activeId = await service.getActivePlanId();
            expect(activeId).toBe('1');
        });

        it('should return null when no active plan ID', async () => {
            const activeId = await service.getActivePlanId();
            expect(activeId).toBeNull();
        });
    });

    describe('setActivePlanId', () => {
        it('should set active plan ID', async () => {
            await service.setActivePlanId('1');
            const activeId = await service.getActivePlanId();
            expect(activeId).toBe('1');
        });
    });

    describe('getActivePlan', () => {
        it('should return plan by active plan ID', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));
            localStorage.setItem('debtLiteActivePlanId', '1');

            const activePlan = await service.getActivePlan();
            expect(activePlan).toEqual(mockPlans[0]);
        });

        it('should return first active plan if no ID set', async () => {
            localStorage.setItem('debtLitePlans', JSON.stringify(mockPlans));

            const activePlan = await service.getActivePlan();
            expect(activePlan).toEqual(mockPlans[0]); // First plan with isActive: true
        });

        it('should return last plan if no active plan found', async () => {
            const inactivePlans = mockPlans.map(p => ({ ...p, isActive: false }));
            localStorage.setItem('debtLitePlans', JSON.stringify(inactivePlans));

            const activePlan = await service.getActivePlan();
            expect(activePlan).toEqual(inactivePlans[inactivePlans.length - 1]);
        });

        it('should return null when no plans exist', async () => {
            const activePlan = await service.getActivePlan();
            expect(activePlan).toBeNull();
        });
    });

    describe('getPaymentStatus', () => {
        it('should return payment status array', async () => {
            const status: PaymentStatus[] = ['paid', 'pending', 'paid'];
            localStorage.setItem('paymentStatus_1', JSON.stringify(status));

            const result = await service.getPaymentStatus('1');
            expect(result).toEqual(status);
        });

        it('should return empty array when no status exists', async () => {
            const result = await service.getPaymentStatus('1');
            expect(result).toEqual([]);
        });

        it('should return empty array for corrupted JSON', async () => {
            localStorage.setItem('paymentStatus_1', 'invalid json');
            const result = await service.getPaymentStatus('1');
            expect(result).toEqual([]);
        });
    });

    describe('savePaymentStatus', () => {
        it('should save payment status', async () => {
            const status: PaymentStatus[] = ['paid', 'pending'];
            await service.savePaymentStatus('1', status);

            const saved = await service.getPaymentStatus('1');
            expect(saved).toEqual(status);
        });

        it('should throw StorageError on quota exceeded', async () => {
            const status: PaymentStatus[] = ['paid', 'pending'];
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = vi.fn(() => {
                const error = new DOMException('Quota exceeded', 'QuotaExceededError');
                throw error;
            });

            await expect(service.savePaymentStatus('1', status)).rejects.toThrow(StorageError);

            localStorage.setItem = originalSetItem;
        });
    });

    describe('getPaymentTotals', () => {
        it('should return payment totals', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            localStorage.setItem('paymentTotals_1', JSON.stringify(totals));

            const result = await service.getPaymentTotals('1');
            expect(result).toEqual(totals);
        });

        it('should return null when no totals exist', async () => {
            const result = await service.getPaymentTotals('1');
            expect(result).toBeNull();
        });

        it('should return null for corrupted JSON', async () => {
            localStorage.setItem('paymentTotals_1', 'invalid json');
            const result = await service.getPaymentTotals('1');
            expect(result).toBeNull();
        });
    });

    describe('savePaymentTotals', () => {
        it('should save payment totals', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            await service.savePaymentTotals('1', totals);

            const saved = await service.getPaymentTotals('1');
            expect(saved).toEqual(totals);
        });

        it('should throw StorageError on quota exceeded', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = vi.fn(() => {
                const error = new DOMException('Quota exceeded', 'QuotaExceededError');
                throw error;
            });

            await expect(service.savePaymentTotals('1', totals)).rejects.toThrow(StorageError);

            localStorage.setItem = originalSetItem;
        });
    });

    describe('deletePaymentData', () => {
        it('should delete payment status and totals', async () => {
            localStorage.setItem('paymentStatus_1', JSON.stringify(['paid']));
            localStorage.setItem('paymentTotals_1', JSON.stringify({ totalPaid: 1000, remaining: 11000 }));

            await service.deletePaymentData('1');

            expect(localStorage.getItem('paymentStatus_1')).toBeNull();
            expect(localStorage.getItem('paymentTotals_1')).toBeNull();
        });
    });

    describe('clearActivePlanId', () => {
        it('should clear active plan ID', async () => {
            localStorage.setItem('debtLiteActivePlanId', '1');
            await service.clearActivePlanId();

            const activeId = await service.getActivePlanId();
            expect(activeId).toBeNull();
        });
    });
});


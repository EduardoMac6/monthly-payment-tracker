/**
 * API Storage Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiStorageService } from './api.service.js';
import { HttpError } from '../api/http.client.js';
import { StorageError } from '../../utils/errors.js';
import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types/index.js';

// Mock HttpClient
const mockHttpClientInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    addRequestInterceptor: vi.fn(),
    addResponseInterceptor: vi.fn(),
};

vi.mock('../api/http.client.js', () => {
    return {
        HttpClient: class {
            constructor() {
                return mockHttpClientInstance;
            }
        },
        HttpError: class extends Error {
            status: number;
            statusText: string;
            response?: unknown;

            constructor(status: number, statusText: string, message?: string, response?: unknown) {
                super(message || `HTTP ${status}: ${statusText}`);
                this.status = status;
                this.statusText = statusText;
                this.response = response;
            }
        },
    };
});

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

describe('ApiStorageService', () => {
    let service: ApiStorageService;
    let mockHttpClient: {
        get: ReturnType<typeof vi.fn>;
        post: ReturnType<typeof vi.fn>;
        put: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        addRequestInterceptor: ReturnType<typeof vi.fn>;
        addResponseInterceptor: ReturnType<typeof vi.fn>;
    };

    const mockPlans: Plan[] = [
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

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Use the shared mock instance
        mockHttpClient = mockHttpClientInstance;

        // Reset the mock instance methods
        mockHttpClient.get = vi.fn();
        mockHttpClient.post = vi.fn();
        mockHttpClient.put = vi.fn();
        mockHttpClient.delete = vi.fn();
        mockHttpClient.addRequestInterceptor = vi.fn();
        mockHttpClient.addResponseInterceptor = vi.fn();

        service = new ApiStorageService('https://api.example.com');

        // Mock localStorage for activePlanId methods
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(),
                setItem: vi.fn(),
                removeItem: vi.fn(),
            },
            writable: true,
        });
    });

    describe('getPlans', () => {
        it('should return plans from API', async () => {
            mockHttpClient.get.mockResolvedValue({ success: true, data: mockPlans });

            const result = await service.getPlans();

            expect(mockHttpClient.get).toHaveBeenCalledWith('/plans');
            expect(result).toEqual(mockPlans);
        });

        it('should return empty array when API returns non-array', async () => {
            mockHttpClient.get.mockResolvedValue({ success: true, data: null });

            const result = await service.getPlans();

            expect(result).toEqual([]);
        });

        it('should throw StorageError on API error', async () => {
            mockHttpClient.get.mockRejectedValue(new HttpError(500, 'Internal Server Error'));

            await expect(service.getPlans()).rejects.toThrow(StorageError);
        });
    });

    describe('savePlan', () => {
        it('should create new plan when plan does not exist', async () => {
            const newPlan = mockPlans[0];
            mockHttpClient.get.mockResolvedValue({ success: true, data: [] });
            mockHttpClient.post.mockResolvedValue({ success: true });

            await service.savePlan(newPlan);

            expect(mockHttpClient.post).toHaveBeenCalledWith('/plans', newPlan);
        });

        it('should update existing plan', async () => {
            const existingPlan = mockPlans[0];
            const updatedPlan = { ...existingPlan, planName: 'Updated Plan' };
            mockHttpClient.get.mockResolvedValue({ success: true, data: [existingPlan] });
            mockHttpClient.put.mockResolvedValue({ success: true });

            await service.savePlan(updatedPlan);

            expect(mockHttpClient.put).toHaveBeenCalledWith(
                `/plans/${updatedPlan.id}`,
                updatedPlan
            );
        });

        it('should throw StorageError on API error', async () => {
            const plan = mockPlans[0];
            mockHttpClient.get.mockResolvedValue({ success: true, data: [] });
            mockHttpClient.post.mockRejectedValue(new HttpError(500, 'Internal Server Error'));

            await expect(service.savePlan(plan)).rejects.toThrow(StorageError);
        });
    });

    describe('savePlans', () => {
        it('should save multiple plans via bulk endpoint', async () => {
            mockHttpClient.post.mockResolvedValue({ success: true });

            await service.savePlans(mockPlans);

            expect(mockHttpClient.post).toHaveBeenCalledWith('/plans/bulk', { plans: mockPlans });
        });

        it('should throw StorageError on API error', async () => {
            mockHttpClient.post.mockRejectedValue(new HttpError(500, 'Internal Server Error'));

            await expect(service.savePlans(mockPlans)).rejects.toThrow(StorageError);
        });
    });

    describe('deletePlan', () => {
        it('should delete plan from API', async () => {
            mockHttpClient.delete.mockResolvedValue(undefined);

            await service.deletePlan('1');

            expect(mockHttpClient.delete).toHaveBeenCalledWith('/plans/1');
        });

        it('should also delete payment data', async () => {
            mockHttpClient.delete.mockResolvedValue({ success: true });

            await service.deletePlan('1');

            // deletePlan calls delete on plan, then deletePaymentData which only deletes payments
            // (totals are deleted automatically via cascade, so only 2 delete calls)
            expect(mockHttpClient.delete).toHaveBeenCalledTimes(2); // plan, payments
            expect(mockHttpClient.delete).toHaveBeenCalledWith('/plans/1');
            expect(mockHttpClient.delete).toHaveBeenCalledWith('/plans/1/payments');
        });

        it('should throw StorageError on API error', async () => {
            mockHttpClient.delete.mockRejectedValue(new HttpError(404, 'Not Found'));

            await expect(service.deletePlan('1')).rejects.toThrow(StorageError);
        });
    });

    describe('getActivePlanId', () => {
        it('should return active plan ID from localStorage', async () => {
            (window.localStorage.getItem as any).mockReturnValue('1');

            const result = await service.getActivePlanId();

            expect(result).toBe('1');
            expect(window.localStorage.getItem).toHaveBeenCalledWith('debtLiteActivePlanId');
        });

        it('should return null when no active plan ID', async () => {
            (window.localStorage.getItem as any).mockReturnValue(null);

            const result = await service.getActivePlanId();

            expect(result).toBeNull();
        });
    });

    describe('setActivePlanId', () => {
        it('should save active plan ID to localStorage', async () => {
            await service.setActivePlanId('1');

            expect(window.localStorage.setItem).toHaveBeenCalledWith('debtLiteActivePlanId', '1');
        });
    });

    describe('getActivePlan', () => {
        it('should return active plan from API', async () => {
            const activePlan = mockPlans[0];
            (window.localStorage.getItem as any).mockReturnValue('1');
            mockHttpClient.get.mockResolvedValue({ success: true, data: activePlan });

            const result = await service.getActivePlan();

            expect(mockHttpClient.get).toHaveBeenCalledWith('/plans/1');
            expect(result).toEqual(activePlan);
        });

        it('should return null on error', async () => {
            (window.localStorage.getItem as any).mockReturnValue('1');
            mockHttpClient.get.mockRejectedValue(new HttpError(404, 'Not Found'));

            const result = await service.getActivePlan();

            expect(result).toBeNull();
        });

        it('should fallback to finding active plan from all plans', async () => {
            (window.localStorage.getItem as any).mockReturnValue(null);
            mockHttpClient.get.mockResolvedValue({ success: true, data: mockPlans });

            const result = await service.getActivePlan();

            expect(result).toEqual(mockPlans[0]); // First active plan
        });
    });

    describe('getPaymentStatus', () => {
        it('should return payment status from API', async () => {
            const status: PaymentStatus[] = ['paid', 'pending', 'paid'];
            mockHttpClient.get.mockResolvedValue({ success: true, data: status });

            const result = await service.getPaymentStatus('1');

            expect(mockHttpClient.get).toHaveBeenCalledWith('/plans/1/payments');
            expect(result).toEqual(status);
        });

        it('should return empty array on error', async () => {
            mockHttpClient.get.mockRejectedValue(new HttpError(404, 'Not Found'));

            const result = await service.getPaymentStatus('1');

            expect(result).toEqual([]);
        });
    });

    describe('savePaymentStatus', () => {
        it('should save payment status to API', async () => {
            const status: PaymentStatus[] = ['paid', 'pending'];
            mockHttpClient.get.mockResolvedValue({ success: true, data: mockPlans });
            mockHttpClient.put.mockResolvedValue({ success: true });

            await service.savePaymentStatus('1', status);

            // The service transforms the status array into statusData format
            expect(mockHttpClient.put).toHaveBeenCalledWith(
                '/plans/1/payments',
                expect.objectContaining({
                    status: expect.arrayContaining([
                        expect.objectContaining({ monthIndex: expect.any(Number) }),
                    ]),
                })
            );
        });

        it('should throw StorageError on API error', async () => {
            const status: PaymentStatus[] = ['paid'];
            mockHttpClient.put.mockRejectedValue(new HttpError(500, 'Internal Server Error'));

            await expect(service.savePaymentStatus('1', status)).rejects.toThrow(StorageError);
        });
    });

    describe('getPaymentTotals', () => {
        it('should return payment totals from API', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            mockHttpClient.get.mockResolvedValue({ success: true, data: totals });

            const result = await service.getPaymentTotals('1');

            expect(mockHttpClient.get).toHaveBeenCalledWith('/plans/1/totals');
            expect(result).toEqual(totals);
        });

        it('should return null on error', async () => {
            mockHttpClient.get.mockRejectedValue(new HttpError(404, 'Not Found'));

            const result = await service.getPaymentTotals('1');

            expect(result).toBeNull();
        });
    });

    describe('savePaymentTotals', () => {
        it('should save payment totals to API', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            mockHttpClient.put.mockResolvedValue(undefined);

            await service.savePaymentTotals('1', totals);

            expect(mockHttpClient.put).toHaveBeenCalledWith('/plans/1/totals', totals);
        });

        it('should throw StorageError on API error', async () => {
            const totals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            mockHttpClient.put.mockRejectedValue(new HttpError(500, 'Internal Server Error'));

            await expect(service.savePaymentTotals('1', totals)).rejects.toThrow(StorageError);
        });
    });

    describe('deletePaymentData', () => {
        it('should delete payment data from API', async () => {
            mockHttpClient.delete.mockResolvedValue({ success: true });

            await service.deletePaymentData('1');

            // deletePaymentData only deletes payments (totals are deleted automatically via cascade)
            expect(mockHttpClient.delete).toHaveBeenCalledWith('/plans/1/payments');
            expect(mockHttpClient.delete).toHaveBeenCalledTimes(1);
        });

        it('should not throw on error', async () => {
            mockHttpClient.delete.mockRejectedValue(new HttpError(404, 'Not Found'));

            await expect(service.deletePaymentData('1')).resolves.not.toThrow();
        });
    });

    describe('clearActivePlanId', () => {
        it('should remove active plan ID from localStorage', async () => {
            await service.clearActivePlanId();

            expect(window.localStorage.removeItem).toHaveBeenCalledWith('debtLiteActivePlanId');
        });
    });
});

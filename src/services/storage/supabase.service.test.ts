/**
 * Tests for SupabaseStorageService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SupabaseStorageService } from './supabase.service';
import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types';
import { StorageError } from '../../utils/errors';

// Create mock Supabase client
const mockSupabaseClient = {
    from: vi.fn(),
};

// Mock the Supabase config
vi.mock('../../config/supabase.config', () => ({
    getSupabase: vi.fn(() => mockSupabaseClient),
}));

describe('SupabaseStorageService', () => {
    let service: SupabaseStorageService;

    beforeEach(() => {
        service = new SupabaseStorageService();

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getPlans', () => {
        it('should retrieve plans from Supabase', async () => {
            const mockPlans = [
                {
                    id: '1',
                    plan_name: 'Test Plan',
                    total_amount: 1000,
                    number_of_months: 12,
                    monthly_payment: 83.33,
                    debt_owner: 'self',
                    created_at: '2024-01-01',
                    is_active: true,
                },
            ];

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: mockPlans,
                        error: null,
                    }),
                }),
            });

            const plans = await service.getPlans();

            expect(plans).toHaveLength(1);
            expect(plans[0].planName).toBe('Test Plan');
            expect(plans[0].totalAmount).toBe(1000);
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('plans');
        });

        it('should handle Supabase errors', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' },
                    }),
                }),
            });

            await expect(service.getPlans()).rejects.toThrow(StorageError);
        });

        it('should return empty array when no plans exist', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            const plans = await service.getPlans();
            expect(plans).toEqual([]);
        });
    });

    describe('savePlan', () => {
        const testPlan: Plan = {
            id: '1',
            planName: 'Test Plan',
            totalAmount: 1000,
            numberOfMonths: 12,
            monthlyPayment: 83.33,
            debtOwner: 'self',
            createdAt: '2024-01-01',
            isActive: true,
        };

        it('should create new plan in Supabase', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await service.savePlan(testPlan);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('plans');
        });

        it('should update existing plan in Supabase', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: '1' },
                            error: null,
                        }),
                    }),
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await service.savePlan(testPlan);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('plans');
        });

        it('should handle save errors', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
                insert: vi.fn().mockResolvedValue({
                    error: { message: 'Insert failed' },
                }),
            });

            await expect(service.savePlan(testPlan)).rejects.toThrow(StorageError);
        });
    });

    describe('deletePlan', () => {
        it('should delete plan from Supabase', async () => {
            mockSupabaseClient.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await service.deletePlan('1');

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('payment_statuses');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('payment_totals');
            expect(mockSupabaseClient.from).toHaveBeenCalledWith('plans');
        });

        it('should handle delete errors', async () => {
            mockSupabaseClient.from.mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: { message: 'Delete failed' },
                    }),
                }),
            });

            await expect(service.deletePlan('1')).rejects.toThrow(StorageError);
        });
    });

    describe('getActivePlanId', () => {
        it('should retrieve active plan ID from localStorage', async () => {
            const mockLocalStorage = {
                getItem: vi.fn().mockReturnValue('plan-123'),
            };
            global.localStorage = mockLocalStorage as any;

            const planId = await service.getActivePlanId();

            expect(planId).toBe('plan-123');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('debtLiteActivePlanId');
        });

        it('should return null when no active plan', async () => {
            const mockLocalStorage = {
                getItem: vi.fn().mockReturnValue(null),
            };
            global.localStorage = mockLocalStorage as any;

            const planId = await service.getActivePlanId();

            expect(planId).toBeNull();
        });
    });

    describe('setActivePlanId', () => {
        it('should save active plan ID to localStorage', async () => {
            const mockLocalStorage = {
                setItem: vi.fn(),
            };
            global.localStorage = mockLocalStorage as any;

            await service.setActivePlanId('plan-123');

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'debtLiteActivePlanId',
                'plan-123'
            );
        });
    });

    describe('getPaymentStatus', () => {
        it('should retrieve payment status from Supabase', async () => {
            const mockStatuses = [
                { plan_id: '1', month_index: 0, status: 'paid', amount: 100 },
                { plan_id: '1', month_index: 1, status: 'pending', amount: 100 },
            ];

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'payment_statuses') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({
                                    data: mockStatuses,
                                    error: null,
                                }),
                            }),
                        }),
                    };
                }
                if (table === 'plans') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { number_of_months: 2 },
                                    error: null,
                                }),
                            }),
                        }),
                    };
                }
                return {};
            });

            const statuses = await service.getPaymentStatus('1');

            expect(statuses).toHaveLength(2);
            expect(statuses[0]).toBe('paid');
            expect(statuses[1]).toBe('pending');
        });

        it('should return empty array when no payment data', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockResolvedValue({
                            data: [],
                            error: null,
                        }),
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
            });

            const statuses = await service.getPaymentStatus('1');

            expect(statuses).toEqual([]);
        });
    });

    describe('savePaymentStatus', () => {
        it('should save payment status to Supabase', async () => {
            const statuses: PaymentStatus[] = ['paid', 'pending', 'paid'];

            mockSupabaseClient.from.mockImplementation((table: string) => {
                if (table === 'plans') {
                    return {
                        select: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                single: vi.fn().mockResolvedValue({
                                    data: { monthly_payment: 100 },
                                    error: null,
                                }),
                            }),
                        }),
                    };
                }
                if (table === 'payment_statuses') {
                    return {
                        delete: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null }),
                        }),
                        insert: vi.fn().mockResolvedValue({ error: null }),
                    };
                }
                return {};
            });

            await service.savePaymentStatus('1', statuses);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('payment_statuses');
        });
    });

    describe('getPaymentTotals', () => {
        it('should retrieve payment totals from Supabase', async () => {
            const mockTotals = {
                total_paid: 500,
                remaining: 500,
            };

            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: mockTotals,
                            error: null,
                        }),
                    }),
                }),
            });

            const totals = await service.getPaymentTotals('1');

            expect(totals).toEqual({
                totalPaid: 500,
                remaining: 500,
            });
        });

        it('should return null when no totals exist', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { code: 'PGRST116' },
                        }),
                    }),
                }),
            });

            const totals = await service.getPaymentTotals('1');

            expect(totals).toBeNull();
        });
    });

    describe('savePaymentTotals', () => {
        const testTotals: TotalsSnapshot = {
            totalPaid: 500,
            remaining: 500,
        };

        it('should create new totals in Supabase', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: null,
                        }),
                    }),
                }),
                insert: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await service.savePaymentTotals('1', testTotals);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('payment_totals');
        });

        it('should update existing totals in Supabase', async () => {
            mockSupabaseClient.from.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: '1' },
                            error: null,
                        }),
                    }),
                }),
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: null,
                    }),
                }),
            });

            await service.savePaymentTotals('1', testTotals);

            expect(mockSupabaseClient.from).toHaveBeenCalledWith('payment_totals');
        });
    });

    describe('clearActivePlanId', () => {
        it('should clear active plan ID from localStorage', async () => {
            const mockLocalStorage = {
                removeItem: vi.fn(),
            };
            global.localStorage = mockLocalStorage as any;

            await service.clearActivePlanId();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('debtLiteActivePlanId');
        });
    });
});

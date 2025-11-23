import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentsService } from './payments.service.js';
import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types/index.js';
import type { IStorageService } from '../storage/storage.interface.js';

// Mock the storage factory and service
vi.mock('../storage/storage.factory.js', () => ({
    StorageFactory: {
        create: vi.fn(),
    },
}));

// Import after mocks
import { StorageFactory } from '../storage/storage.factory.js';

describe('PaymentsService', () => {
    let mockStorage: IStorageService;
    let mockPlans: Plan[];

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock plans
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
                planName: 'One-time Plan',
                totalAmount: 5000,
                numberOfMonths: 'one-time',
                monthlyPayment: 5000,
                debtOwner: 'other',
                createdAt: '2024-01-02T00:00:00.000Z',
                isActive: false,
            },
        ];

        // Create mock storage service
        mockStorage = {
            getPlans: vi.fn().mockResolvedValue([...mockPlans]),
            savePlan: vi.fn().mockResolvedValue(undefined),
            savePlans: vi.fn().mockResolvedValue(undefined),
            deletePlan: vi.fn().mockResolvedValue(undefined),
            getActivePlanId: vi.fn().mockResolvedValue('1'),
            setActivePlanId: vi.fn().mockResolvedValue(undefined),
            getActivePlan: vi.fn().mockResolvedValue(mockPlans[0]),
            getPaymentStatus: vi.fn().mockResolvedValue([]),
            savePaymentStatus: vi.fn().mockResolvedValue(undefined),
            getPaymentTotals: vi.fn().mockResolvedValue(null),
            savePaymentTotals: vi.fn().mockResolvedValue(undefined),
            deletePaymentData: vi.fn().mockResolvedValue(undefined),
            clearActivePlanId: vi.fn().mockResolvedValue(undefined),
        };

        (StorageFactory.create as any).mockReturnValue(mockStorage);
        (PaymentsService as any).storage = mockStorage;
    });

    describe('getPaidMonthsCount', () => {
        it('should return correct count of paid months', async () => {
            const paymentStatus: PaymentStatus[] = ['paid', 'pending', 'paid', 'pagado', 'pending'];
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            const count = await PaymentsService.getPaidMonthsCount('1');
            expect(count).toBe(3); // 'paid', 'paid', 'pagado'
        });

        it('should return 0 when no payments are paid', async () => {
            const paymentStatus: PaymentStatus[] = ['pending', 'pending', 'pending'];
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            const count = await PaymentsService.getPaidMonthsCount('1');
            expect(count).toBe(0);
        });

        it('should return 0 when payment status array is empty', async () => {
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce([]);

            const count = await PaymentsService.getPaidMonthsCount('1');
            expect(count).toBe(0);
        });
    });

    describe('getPlanPaymentStatus', () => {
        it('should return cached totals if available', async () => {
            const cachedTotals: TotalsSnapshot = { totalPaid: 5000, remaining: 7000 };
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(cachedTotals);

            const status = await PaymentsService.getPlanPaymentStatus('1', mockPlans);
            expect(status).toEqual(cachedTotals);
            expect(mockStorage.getPaymentTotals).toHaveBeenCalledWith('1');
        });

        it('should return zero totals when no payment status exists', async () => {
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce([]);

            const status = await PaymentsService.getPlanPaymentStatus('1', mockPlans);
            expect(status).toEqual({ totalPaid: 0, remaining: 0 });
        });

        it('should calculate totals correctly for monthly plan', async () => {
            const paymentStatus: PaymentStatus[] = ['paid', 'paid', 'pending', 'pending'];
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            const status = await PaymentsService.getPlanPaymentStatus('1', mockPlans);
            // Plan: $12,000 in 12 months, $1,000/month
            // 2 months paid = $2,000
            expect(status.totalPaid).toBe(2000);
            expect(status.remaining).toBe(10000);
        });

        it('should calculate totals correctly for one-time plan', async () => {
            const paymentStatus: PaymentStatus[] = ['paid'];
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            const status = await PaymentsService.getPlanPaymentStatus('2', mockPlans);
            // One-time plan: $5,000, if paid = full amount
            expect(status.totalPaid).toBe(5000);
            expect(status.remaining).toBe(0);
        });

        it('should handle last month remainder correctly', async () => {
            // Plan: $12,000 in 12 months = $1,000/month
            // But last month might have remainder due to rounding
            const paymentStatus: PaymentStatus[] = new Array(12).fill('pending');
            paymentStatus[11] = 'paid'; // Last month paid
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            const status = await PaymentsService.getPlanPaymentStatus('1', mockPlans);
            // Last month gets remainder: $12,000 - ($1,000 * 11) = $1,000
            expect(status.totalPaid).toBe(1000);
            expect(status.remaining).toBe(11000);
        });

        it('should return zero totals when plan not found', async () => {
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(['paid']);

            const status = await PaymentsService.getPlanPaymentStatus('999', mockPlans);
            expect(status).toEqual({ totalPaid: 0, remaining: 0 });
        });
    });

    describe('savePaymentStatus', () => {
        it('should save payment status and totals', async () => {
            const paymentStatus: PaymentStatus[] = ['paid', 'pending'];
            const totals: TotalsSnapshot = { totalPaid: 1000, remaining: 11000 };

            await PaymentsService.savePaymentStatus('1', paymentStatus, totals);

            expect(mockStorage.savePaymentStatus).toHaveBeenCalledWith('1', paymentStatus);
            expect(mockStorage.savePaymentTotals).toHaveBeenCalledWith('1', totals);
        });

        it('should calculate totals if not provided', async () => {
            const paymentStatus: PaymentStatus[] = ['paid', 'pending'];
            (mockStorage.getPaymentTotals as any).mockResolvedValueOnce(null);
            (mockStorage.getPaymentStatus as any).mockResolvedValueOnce(paymentStatus);

            await PaymentsService.savePaymentStatus('1', paymentStatus, undefined, mockPlans);

            expect(mockStorage.savePaymentStatus).toHaveBeenCalledWith('1', paymentStatus);
            expect(mockStorage.savePaymentTotals).toHaveBeenCalled();
        });

        it('should not save totals if not provided and no plans available', async () => {
            const paymentStatus: PaymentStatus[] = ['paid', 'pending'];

            await PaymentsService.savePaymentStatus('1', paymentStatus);

            expect(mockStorage.savePaymentStatus).toHaveBeenCalledWith('1', paymentStatus);
            expect(mockStorage.savePaymentTotals).not.toHaveBeenCalled();
        });
    });

    describe('clearPaymentRecords', () => {
        it('should delete payment data for a plan', async () => {
            await PaymentsService.clearPaymentRecords('1');
            expect(mockStorage.deletePaymentData).toHaveBeenCalledWith('1');
        });
    });

    describe('calculateTotalsFromToggles', () => {
        it('should calculate totals from checked toggles', () => {
            // Create mock NodeList
            const toggles = [
                { checked: true, dataset: { amount: '1000' } },
                { checked: true, dataset: { amount: '1000' } },
                { checked: false, dataset: { amount: '1000' } },
                { checked: true, dataset: { amount: '500' } },
            ] as any;

            const totals = PaymentsService.calculateTotalsFromToggles(5000, toggles as any);

            expect(totals.totalPaid).toBe(2500); // 1000 + 1000 + 500
            expect(totals.remaining).toBe(2500); // 5000 - 2500
        });

        it('should return zero paid when no toggles are checked', () => {
            const toggles = [
                { checked: false, dataset: { amount: '1000' } },
                { checked: false, dataset: { amount: '1000' } },
            ] as any;

            const totals = PaymentsService.calculateTotalsFromToggles(5000, toggles as any);

            expect(totals.totalPaid).toBe(0);
            expect(totals.remaining).toBe(5000);
        });

        it('should handle missing amount in dataset', () => {
            const toggles = [
                { checked: true, dataset: {} },
                { checked: true, dataset: { amount: '1000' } },
            ] as any;

            const totals = PaymentsService.calculateTotalsFromToggles(5000, toggles as any);

            expect(totals.totalPaid).toBe(1000); // Only the one with amount
            expect(totals.remaining).toBe(4000);
        });

        it('should handle empty toggles array', () => {
            const toggles = [] as any;

            const totals = PaymentsService.calculateTotalsFromToggles(5000, toggles);

            expect(totals.totalPaid).toBe(0);
            expect(totals.remaining).toBe(5000);
        });
    });
});


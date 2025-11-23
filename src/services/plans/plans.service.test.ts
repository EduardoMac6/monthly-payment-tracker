import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Plan } from '../../types/index.js';
import type { IStorageService } from '../storage/storage.interface.js';

// Mock the storage factory and service BEFORE importing PlansService
vi.mock('../storage/storage.factory.js', () => ({
    StorageFactory: {
        create: vi.fn(),
        reset: vi.fn(),
    },
}));

// Mock environment config
vi.mock('../../config/env.config.js', () => ({
    getMaxPlans: vi.fn(() => 50),
    getMaxPlanAmount: vi.fn(() => 1000000000),
    getMaxPlanMonths: vi.fn(() => 120),
    getAppName: vi.fn(() => 'DebtLite'),
    getEnvStorageType: vi.fn(() => 'localStorage'),
    getApiUrl: vi.fn(() => 'http://localhost:3000/api'),
    env: {
        VITE_APP_NAME: 'DebtLite',
        VITE_STORAGE_TYPE: 'localStorage',
        VITE_API_URL: 'http://localhost:3000/api',
        VITE_MAX_PLANS: 50,
        VITE_MAX_PLAN_AMOUNT: 1000000000,
        VITE_MAX_PLAN_MONTHS: 120,
    },
}));

// Import PlansService AFTER mocks are set up
import { PlansService } from './plans.service.js';
import { StorageFactory } from '../storage/storage.factory.js';

describe('PlansService', () => {
    let mockStorage: IStorageService;
    let mockPlans: Plan[];

    beforeEach(() => {
        // Reset mocks before each test
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
                planName: 'Test Plan 2',
                totalAmount: 5000,
                numberOfMonths: 5,
                monthlyPayment: 1000,
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

        // Set the mock storage in the factory
        (StorageFactory.create as any).mockReturnValue(mockStorage);

        // Reset the PlansService storage by calling the factory again
        // This ensures the service uses our mock
        (PlansService as any).storage = mockStorage;
    });

    describe('getAllPlans', () => {
        it('should return all plans from storage', async () => {
            const plans = await PlansService.getAllPlans();
            expect(plans).toEqual(mockPlans);
            expect(mockStorage.getPlans).toHaveBeenCalledOnce();
        });

        it('should return empty array when no plans exist', async () => {
            (mockStorage.getPlans as any).mockResolvedValueOnce([]);
            const plans = await PlansService.getAllPlans();
            expect(plans).toEqual([]);
        });
    });

    describe('getActivePlan', () => {
        it('should return active plan from storage', async () => {
            const plan = await PlansService.getActivePlan();
            expect(plan).toEqual(mockPlans[0]);
            expect(mockStorage.getActivePlan).toHaveBeenCalledOnce();
        });

        it('should return null when no active plan exists', async () => {
            (mockStorage.getActivePlan as any).mockResolvedValueOnce(null);
            const plan = await PlansService.getActivePlan();
            expect(plan).toBeNull();
        });
    });

    describe('getPlanById', () => {
        it('should return plan with matching ID', async () => {
            const plan = await PlansService.getPlanById('1');
            expect(plan).toEqual(mockPlans[0]);
        });

        it('should return undefined for non-existent plan', async () => {
            const plan = await PlansService.getPlanById('999');
            expect(plan).toBeUndefined();
        });
    });

    describe('createPlan', () => {
        it('should create a new plan with valid data', async () => {
            const newPlanData = {
                planName: 'New Plan',
                totalAmount: 6000,
                numberOfMonths: 6,
                debtOwner: 'self' as const,
            };

            const createdPlan = await PlansService.createPlan(newPlanData);

            expect(createdPlan).toMatchObject({
                planName: 'New Plan',
                totalAmount: 6000,
                numberOfMonths: 6,
                debtOwner: 'self',
                isActive: true,
            });
            expect(createdPlan.id).toBeDefined();
            expect(createdPlan.createdAt).toBeDefined();
            expect(createdPlan.monthlyPayment).toBe(1000); // 6000 / 6

            // Verify that all existing plans were deactivated
            expect(mockStorage.savePlans).toHaveBeenCalled();
            const savedPlans = (mockStorage.savePlans as any).mock.calls[0][0];
            expect(
                savedPlans.every((p: Plan) => p.id !== createdPlan.id || p.isActive === true)
            ).toBe(true);
            expect(
                savedPlans
                    .filter((p: Plan) => p.id !== createdPlan.id)
                    .every((p: Plan) => !p.isActive)
            ).toBe(true);
        });

        it('should throw ValidationError for invalid plan name', async () => {
            const invalidPlanData = {
                planName: '', // Invalid: empty
                totalAmount: 1000,
                numberOfMonths: 12,
                debtOwner: 'self' as const,
            };

            await expect(PlansService.createPlan(invalidPlanData)).rejects.toThrow();
        });

        it('should throw ValidationError for invalid amount', async () => {
            const invalidPlanData = {
                planName: 'Valid Name',
                totalAmount: -100, // Invalid: negative
                numberOfMonths: 12,
                debtOwner: 'self' as const,
            };

            await expect(PlansService.createPlan(invalidPlanData)).rejects.toThrow();
        });

        it('should calculate monthly payment correctly for one-time payment', async () => {
            const newPlanData = {
                planName: 'One-time Plan',
                totalAmount: 5000,
                numberOfMonths: 'one-time' as const,
                debtOwner: 'self' as const,
            };

            const createdPlan = await PlansService.createPlan(newPlanData);
            expect(createdPlan.monthlyPayment).toBe(5000); // Should equal total amount
        });
    });

    describe('updatePlan', () => {
        it('should update a plan', async () => {
            const updates = { planName: 'Updated Plan Name' };
            const updatedPlan = await PlansService.updatePlan('1', updates);

            expect(updatedPlan.planName).toBe('Updated Plan Name');
            expect(mockStorage.savePlans).toHaveBeenCalled();
        });

        it('should validate plan data when updating name', async () => {
            const updates = { planName: '' }; // Invalid: empty name

            await expect(PlansService.updatePlan('1', updates)).rejects.toThrow();
        });

        it('should validate plan data when updating amount', async () => {
            const updates = { totalAmount: -100 }; // Invalid: negative amount

            await expect(PlansService.updatePlan('1', updates)).rejects.toThrow();
        });

        it('should throw error when plan not found', async () => {
            await expect(PlansService.updatePlan('999', { planName: 'Test' })).rejects.toThrow(
                'not found'
            );
        });
    });

    describe('deletePlan', () => {
        it('should delete a plan by ID', async () => {
            await PlansService.deletePlan('1');
            expect(mockStorage.deletePaymentData).toHaveBeenCalledWith('1');
            expect(mockStorage.savePlans).toHaveBeenCalled();
        });

        it('should throw error when trying to delete non-existent plan', async () => {
            (mockStorage.getPlans as any).mockResolvedValueOnce([...mockPlans]);
            await expect(PlansService.deletePlan('999')).rejects.toThrow('not found');
        });

        it('should activate another plan when deleting active plan', async () => {
            (mockStorage.getActivePlan as any).mockResolvedValueOnce(mockPlans[0]);
            const remainingPlans = [mockPlans[1]];
            (mockStorage.getPlans as any).mockResolvedValueOnce([...mockPlans]);
            (mockStorage.getPlans as any).mockResolvedValueOnce(remainingPlans);

            await PlansService.deletePlan('1');

            expect(mockStorage.setActivePlanId).toHaveBeenCalled();
        });

        it('should clear active plan ID when deleting last plan', async () => {
            (mockStorage.getActivePlan as any).mockResolvedValueOnce(mockPlans[0]);
            (mockStorage.getPlans as any).mockResolvedValueOnce([mockPlans[0]]);
            (mockStorage.getPlans as any).mockResolvedValueOnce([]);

            await PlansService.deletePlan('1');

            expect(mockStorage.clearActivePlanId).toHaveBeenCalled();
        });
    });

    describe('switchToPlan', () => {
        it('should switch to a different plan', async () => {
            await PlansService.switchToPlan('2');

            expect(mockStorage.savePlans).toHaveBeenCalled();
            expect(mockStorage.setActivePlanId).toHaveBeenCalledWith('2');
        });

        it('should throw error when plan not found', async () => {
            await expect(PlansService.switchToPlan('999')).rejects.toThrow('not found');
        });

        it('should deactivate all plans before activating target', async () => {
            await PlansService.switchToPlan('2');

            const savedPlans = (mockStorage.savePlans as any).mock.calls[0][0];
            expect(savedPlans.every((p: Plan) => !p.isActive || p.id === '2')).toBe(true);
        });
    });
});

/**
 * Plans Service Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlansService } from '../../src/services/plans.service.js';
import { prisma } from '../../src/config/database.js';
import { AppError } from '../../src/errors/app.error.js';

// Mock Prisma
vi.mock('../../src/config/database.js', () => ({
    prisma: {
        plan: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

describe('PlansService', () => {
    let service: PlansService;
    const mockUserId = 'user-123';

    beforeEach(() => {
        service = new PlansService();
        vi.clearAllMocks();
    });

    describe('getAllPlans', () => {
        it('should return all plans for a user', async () => {
            const mockPlans = [
                {
                    id: '1',
                    userId: mockUserId,
                    planName: 'Test Plan',
                    totalAmount: 1000,
                    numberOfMonths: 1,
                    monthlyPayment: 1000,
                    debtOwner: 'self',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            (prisma.plan.findMany as any).mockResolvedValue(mockPlans);

            const result = await service.getAllPlans(mockUserId);

            expect(prisma.plan.findMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockPlans);
        });
    });

    describe('getPlanById', () => {
        it('should return plan if it exists and belongs to user', async () => {
            const mockPlan = {
                id: '1',
                userId: mockUserId,
                planName: 'Test Plan',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                debtOwner: 'self',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.plan.findFirst as any).mockResolvedValue(mockPlan);

            const result = await service.getPlanById('1', mockUserId);

            expect(prisma.plan.findFirst).toHaveBeenCalledWith({
                where: { id: '1', userId: mockUserId },
            });
            expect(result).toEqual(mockPlan);
        });

        it('should throw error if plan not found', async () => {
            (prisma.plan.findFirst as any).mockResolvedValue(null);

            await expect(service.getPlanById('1', mockUserId)).rejects.toThrow(AppError);
            await expect(service.getPlanById('1', mockUserId)).rejects.toThrow('Plan not found');
        });
    });

    describe('createPlan', () => {
        it('should create a new plan', async () => {
            const planData = {
                planName: 'New Plan',
                totalAmount: 12000,
                numberOfMonths: 12,
                monthlyPayment: 1000,
                debtOwner: 'self' as const,
                isActive: true,
            };

            const mockPlan = {
                id: '1',
                userId: mockUserId,
                ...planData,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.plan.create as any).mockResolvedValue(mockPlan);

            const result = await service.createPlan(planData, mockUserId);

            expect(prisma.plan.create).toHaveBeenCalledWith({
                data: {
                    ...planData,
                    userId: mockUserId,
                    numberOfMonths: 12,
                },
            });
            expect(result).toEqual(mockPlan);
        });
    });

    describe('updatePlan', () => {
        it('should update plan if it exists and belongs to user', async () => {
            const existingPlan = {
                id: '1',
                userId: mockUserId,
                planName: 'Old Plan',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                debtOwner: 'self',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.plan.findFirst as any).mockResolvedValue(existingPlan);

            const updateData = {
                planName: 'Updated Plan',
            };

            const updatedPlan = {
                ...existingPlan,
                ...updateData,
            };

            (prisma.plan.update as any).mockResolvedValue(updatedPlan);

            const result = await service.updatePlan('1', updateData, mockUserId);

            expect(prisma.plan.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: updateData,
            });
            expect(result).toEqual(updatedPlan);
        });
    });

    describe('deletePlan', () => {
        it('should delete plan if it exists and belongs to user', async () => {
            const existingPlan = {
                id: '1',
                userId: mockUserId,
                planName: 'Test Plan',
                totalAmount: 1000,
                numberOfMonths: 1,
                monthlyPayment: 1000,
                debtOwner: 'self',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.plan.findFirst as any).mockResolvedValue(existingPlan);
            (prisma.plan.delete as any).mockResolvedValue(existingPlan);

            await service.deletePlan('1', mockUserId);

            expect(prisma.plan.delete).toHaveBeenCalledWith({
                where: { id: '1' },
            });
        });
    });
});


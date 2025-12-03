/**
 * Plans Service
 * Business logic for plan operations
 */

import { prisma } from '../config/database.js';
import { PlanCreateInput, PlanUpdateInput, BulkPlansInput } from '../types/plans.types.js';
import { AppError } from '../errors/app.error.js';

export class PlansService {
    /**
     * Get all plans for a user
     */
    async getAllPlans(userId: string) {
        return prisma.plan.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Get plan by ID (with authorization check)
     */
    async getPlanById(id: string, userId: string) {
        const plan = await prisma.plan.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        return plan;
    }

    /**
     * Create a new plan
     */
    async createPlan(data: PlanCreateInput, userId: string) {
        return prisma.plan.create({
            data: {
                ...data,
                userId,
                numberOfMonths: data.numberOfMonths ?? null,
            },
        });
    }

    /**
     * Update a plan
     */
    async updatePlan(id: string, data: PlanUpdateInput, userId: string) {
        // Check if plan exists and belongs to user
        await this.getPlanById(id, userId);

        return prisma.plan.update({
            where: { id },
            data: {
                ...data,
                numberOfMonths: data.numberOfMonths ?? undefined,
            },
        });
    }

    /**
     * Delete a plan
     */
    async deletePlan(id: string, userId: string) {
        // Check if plan exists and belongs to user
        await this.getPlanById(id, userId);

        // Delete plan (cascade will delete payment data)
        await prisma.plan.delete({
            where: { id },
        });
    }

    /**
     * Bulk save plans
     */
    async bulkSavePlans(data: BulkPlansInput, userId: string) {
        const operations = data.plans.map((plan) => {
            if (plan.id) {
                // Update existing plan
                return prisma.plan.update({
                    where: {
                        id: plan.id,
                        userId, // Ensure user owns the plan
                    },
                    data: {
                        planName: plan.planName,
                        totalAmount: plan.totalAmount,
                        numberOfMonths: plan.numberOfMonths ?? null,
                        monthlyPayment: plan.monthlyPayment,
                        debtOwner: plan.debtOwner,
                        isActive: plan.isActive,
                    },
                });
            } else {
                // Create new plan
                return prisma.plan.create({
                    data: {
                        ...plan,
                        userId,
                        numberOfMonths: plan.numberOfMonths ?? null,
                    },
                });
            }
        });

        return prisma.$transaction(operations);
    }
}

export const plansService = new PlansService();


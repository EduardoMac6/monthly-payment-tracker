/**
 * Payments Service
 * Business logic for payment operations
 */

import { prisma } from '../config/database.js';
import { PaymentStatusInput, PaymentTotalsInput } from '../types/payments.types.js';
import { AppError } from '../errors/app.error.js';

export class PaymentsService {
    /**
     * Get payment status for a plan
     */
    async getPaymentStatus(planId: string, userId: string) {
        // Verify plan belongs to user
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        const paymentStatuses = await prisma.paymentStatus.findMany({
            where: { planId },
            orderBy: { monthIndex: 'asc' },
        });

        // Convert to array format expected by frontend
        return paymentStatuses.map((ps) => ps.status);
    }

    /**
     * Save payment status for a plan
     */
    async savePaymentStatus(planId: string, data: PaymentStatusInput, userId: string) {
        // Verify plan belongs to user
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        // Delete existing payment statuses
        await prisma.paymentStatus.deleteMany({
            where: { planId },
        });

        // Create new payment statuses
        const paymentStatuses = data.status.map((status) => ({
            planId,
            monthIndex: status.monthIndex,
            status: status.status,
            amount: status.amount,
            paidAt: status.paidAt ? new Date(status.paidAt) : null,
        }));

        await prisma.paymentStatus.createMany({
            data: paymentStatuses,
        });

        return paymentStatuses;
    }

    /**
     * Get payment totals for a plan
     */
    async getPaymentTotals(planId: string, userId: string) {
        // Verify plan belongs to user
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        const totals = await prisma.paymentTotals.findUnique({
            where: { planId },
        });

        if (!totals) {
            return null;
        }

        return {
            totalPaid: totals.totalPaid,
            remaining: totals.remaining,
        };
    }

    /**
     * Save payment totals for a plan
     */
    async savePaymentTotals(planId: string, data: PaymentTotalsInput, userId: string) {
        // Verify plan belongs to user
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        return prisma.paymentTotals.upsert({
            where: { planId },
            update: {
                totalPaid: data.totalPaid,
                remaining: data.remaining,
            },
            create: {
                planId,
                totalPaid: data.totalPaid,
                remaining: data.remaining,
            },
        });
    }

    /**
     * Delete payment data for a plan
     */
    async deletePaymentData(planId: string, userId: string) {
        // Verify plan belongs to user
        const plan = await prisma.plan.findFirst({
            where: {
                id: planId,
                userId,
            },
        });

        if (!plan) {
            throw new AppError('Plan not found', 404);
        }

        // Delete payment statuses and totals (cascade should handle this, but being explicit)
        await prisma.paymentStatus.deleteMany({
            where: { planId },
        });

        await prisma.paymentTotals.deleteMany({
            where: { planId },
        });
    }
}

export const paymentsService = new PaymentsService();


/**
 * Plans Schemas
 * Zod validation schemas for plan management endpoints
 */

import { z } from 'zod';

export const planCreateSchema = z.object({
    planName: z.string().min(1).max(255),
    totalAmount: z.number().positive(),
    numberOfMonths: z.number().int().positive().nullable(),
    monthlyPayment: z.number().positive(),
    debtOwner: z.enum(['self', 'other']).optional(),
    isActive: z.boolean().optional(),
});

export const planUpdateSchema = planCreateSchema.partial();

export const planIdSchema = z.object({
    id: z.string().min(1),
});

export const bulkPlansSchema = z.object({
    plans: z.array(
        z.object({
            id: z.string().optional(),
            planName: z.string().min(1).max(255),
            totalAmount: z.number().positive(),
            numberOfMonths: z.number().int().positive().nullable(),
            monthlyPayment: z.number().positive(),
            debtOwner: z.enum(['self', 'other']).optional(),
            isActive: z.boolean().optional(),
        })
    ),
});


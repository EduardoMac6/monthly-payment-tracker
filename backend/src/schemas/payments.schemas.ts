/**
 * Payments Schemas
 * Zod validation schemas for payment management endpoints
 */

import { z } from 'zod';

export const paymentStatusSchema = z.object({
    status: z.array(
        z.object({
            monthIndex: z.number().int().min(0),
            status: z.string(),
            amount: z.number().positive(),
            paidAt: z.string().nullable().optional(),
        })
    ),
});

export const paymentTotalsSchema = z.object({
    totalPaid: z.number().min(0),
    remaining: z.number().min(0),
});


/**
 * Payments Routes
 * API routes for payment management
 */

import { Router } from 'express';
import { z } from 'zod';
import { paymentsController } from '../controllers/payments.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { AuthRequest } from '../controllers/plans.controller.js';

const router = Router();

// Validation schemas
const planIdSchema = z.object({
    id: z.string().min(1),
});

const paymentStatusSchema = z.object({
    status: z.array(
        z.object({
            monthIndex: z.number().int().min(0),
            status: z.string(),
            amount: z.number().positive(),
            paidAt: z.string().nullable().optional(),
        })
    ),
});

const paymentTotalsSchema = z.object({
    totalPaid: z.number().min(0),
    remaining: z.number().min(0),
});

import { authenticate } from '../middleware/auth.middleware.js';
router.use(authenticate);

// Routes
router.get(
    '/:id/payments',
    validateParams(planIdSchema),
    paymentsController.getPaymentStatus.bind(paymentsController)
);

router.put(
    '/:id/payments',
    validateParams(planIdSchema),
    validateBody(paymentStatusSchema),
    paymentsController.savePaymentStatus.bind(paymentsController)
);

router.get(
    '/:id/totals',
    validateParams(planIdSchema),
    paymentsController.getPaymentTotals.bind(paymentsController)
);

router.put(
    '/:id/totals',
    validateParams(planIdSchema),
    validateBody(paymentTotalsSchema),
    paymentsController.savePaymentTotals.bind(paymentsController)
);

router.delete(
    '/:id/payments',
    validateParams(planIdSchema),
    paymentsController.deletePaymentData.bind(paymentsController)
);

export default router;


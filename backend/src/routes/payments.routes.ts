/**
 * Payments Routes
 * API routes for payment management
 */

import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import { planIdSchema } from '../schemas/plans.schemas.js';
import {
    paymentStatusSchema,
    paymentTotalsSchema,
} from '../schemas/payments.schemas.js';

const router = Router();

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


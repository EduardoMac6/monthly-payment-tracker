/**
 * Plans Routes
 * API routes for plan management
 */

import { Router } from 'express';
import { z } from 'zod';
import { plansController, AuthRequest } from '../controllers/plans.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';

const router = Router();

// Validation schemas
const planCreateSchema = z.object({
    planName: z.string().min(1).max(255),
    totalAmount: z.number().positive(),
    numberOfMonths: z.number().int().positive().nullable(),
    monthlyPayment: z.number().positive(),
    debtOwner: z.enum(['self', 'other']).optional(),
    isActive: z.boolean().optional(),
});

const planUpdateSchema = planCreateSchema.partial();

const planIdSchema = z.object({
    id: z.string().min(1),
});

const bulkPlansSchema = z.object({
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

// Routes
import { authenticate } from '../middleware/auth.middleware.js';
router.use(authenticate);

router.get('/', plansController.getAllPlans.bind(plansController));
router.get('/:id', validateParams(planIdSchema), plansController.getPlanById.bind(plansController));
router.post('/', validateBody(planCreateSchema), plansController.createPlan.bind(plansController));
router.post('/bulk', validateBody(bulkPlansSchema), plansController.bulkSavePlans.bind(plansController));
router.put('/:id', validateParams(planIdSchema), validateBody(planUpdateSchema), plansController.updatePlan.bind(plansController));
router.delete('/:id', validateParams(planIdSchema), plansController.deletePlan.bind(plansController));

export default router;


/**
 * Plans Routes
 * API routes for plan management
 */

import { Router } from 'express';
import { plansController } from '../controllers/plans.controller.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import {
    planCreateSchema,
    planUpdateSchema,
    planIdSchema,
    bulkPlansSchema,
} from '../schemas/plans.schemas.js';

const router = Router();

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


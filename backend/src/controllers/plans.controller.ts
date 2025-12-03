/**
 * Plans Controller
 * Handles HTTP requests for plans
 */

import { Response, NextFunction } from 'express';
import { plansService } from '../services/plans.service.js';
import { PlanCreateInput, PlanUpdateInput, BulkPlansInput, AuthRequest } from '../types/index.js';

export class PlansController {
    /**
     * Get all plans
     * GET /api/plans
     */
    async getAllPlans(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const plans = await plansService.getAllPlans(userId);
            res.json({
                success: true,
                data: plans,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get plan by ID
     * GET /api/plans/:id
     */
    async getPlanById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.userId!;
            const plan = await plansService.getPlanById(id, userId);
            res.json({
                success: true,
                data: plan,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create plan
     * POST /api/plans
     */
    async createPlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const data = req.body as PlanCreateInput;
            const plan = await plansService.createPlan(data, userId);
            res.status(201).json({
                success: true,
                data: plan,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update plan
     * PUT /api/plans/:id
     */
    async updatePlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.userId!;
            const data = req.body as PlanUpdateInput;
            const plan = await plansService.updatePlan(id, data, userId);
            res.json({
                success: true,
                data: plan,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete plan
     * DELETE /api/plans/:id
     */
    async deletePlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userId = req.userId!;
            await plansService.deletePlan(id, userId);
            res.json({
                success: true,
                message: 'Plan deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk save plans
     * POST /api/plans/bulk
     */
    async bulkSavePlans(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const data = req.body as BulkPlansInput;
            const plans = await plansService.bulkSavePlans(data, userId);
            res.status(201).json({
                success: true,
                data: plans,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const plansController = new PlansController();


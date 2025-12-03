/**
 * Payments Controller
 * Handles HTTP requests for payments
 */

import { Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments.service.js';
import { PaymentStatusInput, PaymentTotalsInput } from '../utils/types.js';
import { AuthRequest } from './plans.controller.js';

export class PaymentsController {
    /**
     * Get payment status
     * GET /api/plans/:id/payments
     */
    async getPaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id: planId } = req.params;
            const userId = req.userId!;
            const status = await paymentsService.getPaymentStatus(planId, userId);
            res.json({
                success: true,
                data: status,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save payment status
     * PUT /api/plans/:id/payments
     */
    async savePaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id: planId } = req.params;
            const userId = req.userId!;
            const data = req.body as PaymentStatusInput;
            const status = await paymentsService.savePaymentStatus(planId, data, userId);
            res.json({
                success: true,
                data: status,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get payment totals
     * GET /api/plans/:id/totals
     */
    async getPaymentTotals(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id: planId } = req.params;
            const userId = req.userId!;
            const totals = await paymentsService.getPaymentTotals(planId, userId);
            res.json({
                success: true,
                data: totals,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save payment totals
     * PUT /api/plans/:id/totals
     */
    async savePaymentTotals(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id: planId } = req.params;
            const userId = req.userId!;
            const data = req.body as PaymentTotalsInput;
            const totals = await paymentsService.savePaymentTotals(planId, data, userId);
            res.json({
                success: true,
                data: totals,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete payment data
     * DELETE /api/plans/:id/payments
     */
    async deletePaymentData(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id: planId } = req.params;
            const userId = req.userId!;
            await paymentsService.deletePaymentData(planId, userId);
            res.json({
                success: true,
                message: 'Payment data deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const paymentsController = new PaymentsController();


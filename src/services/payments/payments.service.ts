import type { Plan, PaymentStatus, TotalsSnapshot, PlanPaymentStatus } from '../../types/index.js';
import { StorageFactory } from '../storage/storage.factory.js';
import type { IStorageService } from '../storage/storage.interface.js';

/**
 * Payments Service
 *
 * Handles all business logic related to payment tracking including:
 * - Tracking payment status for each month
 * - Calculating totals (paid and remaining)
 * - Managing payment records
 * - Caching payment totals for performance
 *
 * @example
 * ```typescript
 * // Get payment status for a plan
 * const status = await PaymentsService.getPlanPaymentStatus(planId, allPlans);
 * console.log(`Paid: ${status.totalPaid}, Remaining: ${status.remaining}`);
 *
 * // Save payment status
 * await PaymentsService.savePaymentStatus(planId, ['paid', 'unpaid', 'paid']);
 * ```
 */
export class PaymentsService {
    private static storage: IStorageService = StorageFactory.create();

    /**
     * Get paid months count for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves to number of paid months
     */
    static async getPaidMonthsCount(planId: string): Promise<number> {
        const statusArray = await this.storage.getPaymentStatus(planId);
        return statusArray.filter((status) => status === 'paid' || status === 'pagado').length;
    }

    /**
     * Calculate payment status for a plan
     * @param planId - Plan ID
     * @param allPlans - Array of all plans (for finding the plan)
     * @returns Promise that resolves to payment status with total paid and remaining
     */
    static async getPlanPaymentStatus(
        planId: string,
        allPlans: Plan[]
    ): Promise<PlanPaymentStatus> {
        // Try to get cached totals first
        const savedTotals = await this.storage.getPaymentTotals(planId);
        if (savedTotals) {
            return savedTotals;
        }

        // Calculate from status array
        const savedStatus = await this.storage.getPaymentStatus(planId);
        if (savedStatus.length === 0) {
            return { totalPaid: 0, remaining: 0 };
        }

        const plan = allPlans.find((p) => p.id === planId);
        if (!plan) {
            return { totalPaid: 0, remaining: 0 };
        }

        const planTotalCost = plan.totalAmount;
        const planMonths = plan.numberOfMonths === 'one-time' ? 1 : plan.numberOfMonths;
        const planMonthlyPayment = plan.monthlyPayment;

        let paid = 0;
        savedStatus.forEach((status, idx) => {
            if (status === 'paid' || status === 'pagado') {
                if (plan.numberOfMonths === 'one-time') {
                    paid += planTotalCost;
                } else {
                    // Calculate payment amount for this month
                    // Last month gets the remainder
                    const payment =
                        idx === planMonths - 1
                            ? planTotalCost - planMonthlyPayment * (planMonths - 1)
                            : planMonthlyPayment;
                    paid += payment;
                }
            }
        });

        return {
            totalPaid: paid,
            remaining: planTotalCost - paid,
        };
    }

    /**
     * Save payment status for a plan
     * @param planId - Plan ID
     * @param statusArray - Array of payment statuses
     * @param totals - Optional totals snapshot (will be calculated if not provided)
     * @param allPlans - Array of all plans (for calculating totals)
     * @returns Promise that resolves when payment status is saved
     */
    static async savePaymentStatus(
        planId: string,
        statusArray: PaymentStatus[],
        totals?: TotalsSnapshot,
        allPlans?: Plan[]
    ): Promise<void> {
        // Save status array
        await this.storage.savePaymentStatus(planId, statusArray);

        // Calculate and save totals if not provided
        if (!totals && allPlans) {
            totals = await this.getPlanPaymentStatus(planId, allPlans);
        }

        if (totals) {
            await this.storage.savePaymentTotals(planId, totals);
        }
    }

    /**
     * Clear payment records for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves when payment records are cleared
     */
    static async clearPaymentRecords(planId: string): Promise<void> {
        await this.storage.deletePaymentData(planId);
    }

    /**
     * Calculate totals from payment toggles in DOM
     * @param totalCost - Total cost of the plan
     * @param paymentToggles - NodeList of payment toggle checkboxes
     * @returns Totals snapshot
     */
    static calculateTotalsFromToggles(
        totalCost: number,
        paymentToggles: NodeListOf<HTMLInputElement>
    ): TotalsSnapshot {
        let currentTotalPaid = 0;

        paymentToggles.forEach((toggle) => {
            if (toggle.checked) {
                const amount = toggle.dataset.amount;
                if (amount) {
                    currentTotalPaid += parseFloat(amount);
                }
            }
        });

        return {
            totalPaid: currentTotalPaid,
            remaining: totalCost - currentTotalPaid,
        };
    }
}

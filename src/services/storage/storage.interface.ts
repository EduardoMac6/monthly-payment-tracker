import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types';

/**
 * Storage Service Interface
 * Defines the contract for storage operations
 * Allows switching between localStorage and API implementations
 */
export interface IStorageService {
    /**
     * Get all plans
     * @returns Promise that resolves to array of plans
     */
    getPlans(): Promise<Plan[]>;

    /**
     * Save a plan
     * @param plan - Plan to save
     * @returns Promise that resolves when plan is saved
     */
    savePlan(plan: Plan): Promise<void>;

    /**
     * Save multiple plans
     * @param plans - Array of plans to save
     * @returns Promise that resolves when plans are saved
     */
    savePlans(plans: Plan[]): Promise<void>;

    /**
     * Delete a plan
     * @param planId - ID of plan to delete
     * @returns Promise that resolves when plan is deleted
     */
    deletePlan(planId: string): Promise<void>;

    /**
     * Get active plan ID
     * @returns Promise that resolves to active plan ID or null
     */
    getActivePlanId(): Promise<string | null>;

    /**
     * Set active plan ID
     * @param planId - Plan ID to set as active
     * @returns Promise that resolves when active plan ID is set
     */
    setActivePlanId(planId: string): Promise<void>;

    /**
     * Get active plan
     * @returns Promise that resolves to active plan or null
     */
    getActivePlan(): Promise<Plan | null>;

    /**
     * Get payment status for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves to array of payment statuses
     */
    getPaymentStatus(planId: string): Promise<PaymentStatus[]>;

    /**
     * Save payment status for a plan
     * @param planId - Plan ID
     * @param status - Array of payment statuses
     * @returns Promise that resolves when payment status is saved
     */
    savePaymentStatus(planId: string, status: PaymentStatus[]): Promise<void>;

    /**
     * Get payment totals for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves to payment totals or null
     */
    getPaymentTotals(planId: string): Promise<TotalsSnapshot | null>;

    /**
     * Save payment totals for a plan
     * @param planId - Plan ID
     * @param totals - Payment totals
     * @returns Promise that resolves when payment totals are saved
     */
    savePaymentTotals(planId: string, totals: TotalsSnapshot): Promise<void>;

    /**
     * Delete payment data for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves when payment data is deleted
     */
    deletePaymentData(planId: string): Promise<void>;

    /**
     * Clear active plan ID
     * @returns Promise that resolves when active plan ID is cleared
     */
    clearActivePlanId(): Promise<void>;
}

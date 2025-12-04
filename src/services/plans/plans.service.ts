import type { Plan } from '../../types/index.js';
import { StorageFactory } from '../storage/storage.factory.js';
import type { IStorageService } from '../storage/storage.interface.js';
import { PlanValidator } from '../../utils/validators.js';
import { ValidationError } from '../../utils/errors.js';
import { getMaxPlans } from '../../config/env.config.js';
import { sanitizePlanName } from '../../utils/sanitizer.js';

/**
 * Plans Service
 *
 * Handles all business logic related to payment plans including:
 * - Creating, reading, updating, and deleting plans
 * - Managing active plan state
 * - Validating plan data
 * - Sanitizing user inputs
 *
 * @example
 * ```typescript
 * // Create a new plan
 * const plan = await PlansService.createPlan({
 *   planName: 'Laptop Payment',
 *   totalAmount: 50000,
 *   numberOfMonths: 12,
 *   debtOwner: 'self'
 * });
 *
 * // Get all plans
 * const allPlans = await PlansService.getAllPlans();
 *
 * // Switch to a different plan
 * await PlansService.switchToPlan(plan.id);
 * ```
 */
export class PlansService {
    private static storage: IStorageService = StorageFactory.create();

    /**
     * Reset storage instance (useful for testing)
     * Forces recreation of storage service from factory
     */
    static resetStorage(): void {
        this.storage = null as any;
    }

    /**
     * Get storage instance (recreates from factory if needed)
     * @returns Storage service instance
     */
    private static getStorage(): IStorageService {
        if (!this.storage) {
            this.storage = StorageFactory.create();
        }
        return this.storage;
    }

    /**
     * Get all plans
     * @returns Promise that resolves to array of all plans
     */
    static async getAllPlans(): Promise<Plan[]> {
        return await this.getStorage().getPlans();
    }

    /**
     * Get active plan
     * @returns Promise that resolves to active plan or null
     */
    static async getActivePlan(): Promise<Plan | null> {
        return await this.getStorage().getActivePlan();
    }

    /**
     * Get plan by ID
     * @param planId - Plan ID
     * @returns Promise that resolves to plan or undefined
     */
    static async getPlanById(planId: string): Promise<Plan | undefined> {
        const plans = await this.getAllPlans();
        return plans.find((p) => p.id === planId);
    }

    /**
     * Create a new payment plan
     *
     * Validates, sanitizes, and creates a new payment plan. The new plan
     * will automatically become the active plan, and all other plans will
     * be deactivated.
     *
     * @param planData - Plan data to create
     * @param planData.planName - Name of the plan (will be sanitized)
     * @param planData.totalAmount - Total amount to pay
     * @param planData.numberOfMonths - Number of months or 'one-time'
     * @param planData.debtOwner - 'self' for my debts, 'other' for receivables
     * @returns Promise that resolves to the created plan
     * @throws {ValidationError} If plan data is invalid or max plans limit reached
     *
     * @example
     * ```typescript
     * const plan = await PlansService.createPlan({
     *   planName: 'Car Loan',
     *   totalAmount: 300000,
     *   numberOfMonths: 36,
     *   debtOwner: 'self'
     * });
     * ```
     */
    static async createPlan(planData: {
        planName: string;
        totalAmount: number;
        numberOfMonths: number | 'one-time';
        debtOwner: 'self' | 'other';
    }): Promise<Plan> {
        // Validate plan data
        const validation = PlanValidator.validatePlan(
            planData.planName,
            planData.totalAmount,
            planData.numberOfMonths
        );

        if (!validation.isValid) {
            const firstError = Object.values(validation.errors)[0];
            throw new ValidationError('plan', firstError || 'Invalid plan data');
        }

        // Calculate monthly payment
        const numberOfMonths = planData.numberOfMonths === 'one-time' ? 1 : planData.numberOfMonths;
        const monthlyPayment =
            numberOfMonths === 1 ? planData.totalAmount : planData.totalAmount / numberOfMonths;

        // Sanitize plan name
        const sanitizedName = sanitizePlanName(planData.planName);

        // Create plan object
        const newPlan: Plan = {
            id: Date.now().toString(),
            planName: sanitizedName,
            totalAmount: planData.totalAmount,
            numberOfMonths: planData.numberOfMonths,
            monthlyPayment: monthlyPayment,
            debtOwner: planData.debtOwner,
            createdAt: new Date().toISOString(),
            isActive: true,
        };

        // Get existing plans
        const existingPlans = await this.getAllPlans();

        // Check maximum number of plans limit
        const maxPlans = getMaxPlans();
        if (existingPlans.length >= maxPlans) {
            throw new ValidationError(
                'plan',
                `Maximum number of plans (${maxPlans}) reached. Please delete a plan before creating a new one.`
            );
        }

        // Deactivate all existing plans (only one active at a time)
        existingPlans.forEach((plan) => {
            plan.isActive = false;
        });

        // Add new plan
        existingPlans.push(newPlan);

        // Save plans
        await this.getStorage().savePlans(existingPlans);
        await this.getStorage().setActivePlanId(newPlan.id);

        return newPlan;
    }

    /**
     * Update a plan
     * @param planId - Plan ID to update
     * @param updates - Partial plan data to update
     * @returns Promise that resolves to updated plan
     */
    static async updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan> {
        const plans = await this.getAllPlans();
        const planIndex = plans.findIndex((p) => p.id === planId);

        if (planIndex === -1) {
            throw new Error(`Plan with ID ${planId} not found`);
        }

        // Update plan
        const updatedPlan = { ...plans[planIndex], ...updates };

        // Validate if name or amount changed
        if (updates.planName !== undefined || updates.totalAmount !== undefined) {
            const validation = PlanValidator.validatePlan(
                updatedPlan.planName,
                updatedPlan.totalAmount,
                updatedPlan.numberOfMonths
            );

            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                throw new ValidationError('plan', firstError || 'Invalid plan data');
            }
        }

        plans[planIndex] = updatedPlan;
        await this.getStorage().savePlans(plans);

        return updatedPlan;
    }

    /**
     * Delete a plan
     * @param planId - Plan ID to delete
     * @returns Promise that resolves when plan is deleted
     */
    static async deletePlan(planId: string): Promise<void> {
        const plans = await this.getAllPlans();
        const planToDelete = plans.find((p) => p.id === planId);

        if (!planToDelete) {
            throw new Error(`Plan with ID ${planId} not found`);
        }

        const remainingPlans = plans.filter((p) => p.id !== planId);

        // Delete payment data associated with the plan
        await this.getStorage().deletePaymentData(planId);

        // If deleting active plan, activate another one
        const activePlan = await this.getActivePlan();
        if (activePlan && activePlan.id === planId) {
            if (remainingPlans.length > 0) {
                // Activate the most recent plan
                const nextPlan = remainingPlans.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                nextPlan.isActive = true;
                await this.getStorage().setActivePlanId(nextPlan.id);
            } else {
                // No more plans, clear active plan ID
                await this.getStorage().clearActivePlanId();
            }
        } else {
            // If deleting non-active plan, ensure the active plan stays active
            // This is important to prevent issues when the remaining plans list
            // doesn't have the correct isActive flags set
            if (activePlan && remainingPlans.some((p) => p.id === activePlan.id)) {
                // Make sure the active plan is marked as active in the remaining plans
                const activePlanInRemaining = remainingPlans.find((p) => p.id === activePlan.id);
                if (activePlanInRemaining) {
                    // Ensure all other plans are inactive
                    remainingPlans.forEach((plan) => {
                        plan.isActive = plan.id === activePlan.id;
                    });
                }
            }
        }

        // Save updated plans
        await this.getStorage().savePlans(remainingPlans);
    }

    /**
     * Switch to a different plan (set as active)
     * @param planId - Plan ID to switch to
     * @returns Promise that resolves when plan is switched
     */
    static async switchToPlan(planId: string): Promise<void> {
        const plans = await this.getAllPlans();
        const targetPlan = plans.find((p) => p.id === planId);

        if (!targetPlan) {
            throw new Error(`Plan with ID ${planId} not found`);
        }

        // Deactivate all plans
        plans.forEach((plan) => {
            plan.isActive = false;
        });

        // Activate target plan
        targetPlan.isActive = true;

        // Save changes
        await this.getStorage().savePlans(plans);
        await this.getStorage().setActivePlanId(planId);
    }
}

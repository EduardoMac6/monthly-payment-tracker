// ValidationError is imported but not used directly in this file
// It's used by the classes that call these validators

import { getMaxPlanAmount, getMaxPlanMonths } from '../config/env.config.js';
import { formatCurrency } from './formatters.js';

/**
 * Validation result type
 */
export type ValidationResult = {
    isValid: boolean;
    error?: string;
};

/**
 * Plan Validator
 *
 * Provides validation functions for payment plan data.
 * All validators use environment variables for maximum values.
 *
 * @example
 * ```typescript
 * // Validate plan name
 * const result = PlanValidator.validatePlanName('My Plan');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 *
 * // Validate complete plan
 * const validation = PlanValidator.validatePlan('Plan', 1000, 12);
 * if (validation.isValid) {
 *   // Proceed with plan creation
 * }
 * ```
 */
export class PlanValidator {
    /**
     * Validate plan name
     * @param name - Plan name to validate
     * @returns Validation result
     */
    static validatePlanName(name: string): ValidationResult {
        if (!name || name.trim().length === 0) {
            return {
                isValid: false,
                error: 'Plan name is required',
            };
        }

        if (name.trim().length < 2) {
            return {
                isValid: false,
                error: 'Plan name must be at least 2 characters long',
            };
        }

        if (name.length > 100) {
            return {
                isValid: false,
                error: 'Plan name must be less than 100 characters',
            };
        }

        return { isValid: true };
    }

    /**
     * Validate amount
     * @param amount - Amount to validate
     * @returns Validation result
     */
    static validateAmount(amount: number): ValidationResult {
        if (isNaN(amount)) {
            return {
                isValid: false,
                error: 'Amount must be a valid number',
            };
        }

        if (amount <= 0) {
            return {
                isValid: false,
                error: 'Amount must be greater than 0',
            };
        }

        const maxAmount = getMaxPlanAmount();
        if (amount > maxAmount) {
            return {
                isValid: false,
                error: `Amount is too large (maximum: ${formatCurrency(maxAmount)})`,
            };
        }

        return { isValid: true };
    }

    /**
     * Validate number of months
     * @param months - Number of months to validate
     * @returns Validation result
     */
    static validateMonths(months: number | 'one-time'): ValidationResult {
        if (months === 'one-time') {
            return { isValid: true };
        }

        if (typeof months !== 'number') {
            return {
                isValid: false,
                error: 'Number of months must be a number or "one-time"',
            };
        }

        if (months < 1) {
            return {
                isValid: false,
                error: 'Number of months must be at least 1',
            };
        }

        const maxMonths = getMaxPlanMonths();
        if (months > maxMonths) {
            return {
                isValid: false,
                error: `Number of months cannot exceed ${maxMonths} (${Math.floor(maxMonths / 12)} years)`,
            };
        }

        return { isValid: true };
    }

    /**
     * Validate complete plan data
     * @param planName - Plan name
     * @param amount - Total amount
     * @param months - Number of months
     * @returns Validation result with field-specific errors
     */
    static validatePlan(
        planName: string,
        amount: number,
        months: number | 'one-time'
    ): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        const nameResult = this.validatePlanName(planName);
        if (!nameResult.isValid && nameResult.error) {
            errors.planName = nameResult.error;
        }

        const amountResult = this.validateAmount(amount);
        if (!amountResult.isValid && amountResult.error) {
            errors.amount = amountResult.error;
        }

        const monthsResult = this.validateMonths(months);
        if (!monthsResult.isValid && monthsResult.error) {
            errors.months = monthsResult.error;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }
}

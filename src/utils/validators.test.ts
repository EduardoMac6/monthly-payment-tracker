import { describe, it, expect, vi } from 'vitest';
import { PlanValidator } from './validators.js';

// Mock environment config
vi.mock('../config/env.config.js', () => ({
    getMaxPlanAmount: () => 1000000000,
    getMaxPlanMonths: () => 120,
}));

describe('PlanValidator', () => {
    describe('validatePlanName', () => {
        it('should return valid for a valid plan name', () => {
            const result = PlanValidator.validatePlanName('My Payment Plan');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return invalid for empty string', () => {
            const result = PlanValidator.validatePlanName('');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Plan name is required');
        });

        it('should return invalid for whitespace only', () => {
            const result = PlanValidator.validatePlanName('   ');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Plan name is required');
        });

        it('should return invalid for name shorter than 2 characters', () => {
            const result = PlanValidator.validatePlanName('A');
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Plan name must be at least 2 characters long');
        });

        it('should return invalid for name longer than 100 characters', () => {
            const longName = 'A'.repeat(101);
            const result = PlanValidator.validatePlanName(longName);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Plan name must be less than 100 characters');
        });

        it('should trim whitespace before validation', () => {
            const result = PlanValidator.validatePlanName('  Valid Name  ');
            expect(result.isValid).toBe(true);
        });
    });

    describe('validateAmount', () => {
        it('should return valid for a valid amount', () => {
            const result = PlanValidator.validateAmount(1000);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return invalid for NaN', () => {
            const result = PlanValidator.validateAmount(NaN);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Amount must be a valid number');
        });

        it('should return invalid for zero', () => {
            const result = PlanValidator.validateAmount(0);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Amount must be greater than 0');
        });

        it('should return invalid for negative amount', () => {
            const result = PlanValidator.validateAmount(-100);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Amount must be greater than 0');
        });

        it('should return invalid for amount exceeding maximum', () => {
            const result = PlanValidator.validateAmount(2000000000);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Amount is too large');
        });
    });

    describe('validateMonths', () => {
        it('should return valid for "one-time"', () => {
            const result = PlanValidator.validateMonths('one-time');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return valid for valid number of months', () => {
            const result = PlanValidator.validateMonths(12);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return invalid for non-number and non-one-time', () => {
            const result = PlanValidator.validateMonths('invalid' as any);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Number of months must be a number or "one-time"');
        });

        it('should return invalid for months less than 1', () => {
            const result = PlanValidator.validateMonths(0);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Number of months must be at least 1');
        });

        it('should return invalid for months exceeding maximum', () => {
            const result = PlanValidator.validateMonths(150);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('Number of months cannot exceed');
        });
    });

    describe('validatePlan', () => {
        it('should return valid for valid plan data', () => {
            const result = PlanValidator.validatePlan(
                'My Plan',
                1000,
                12
            );
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should return invalid with all errors for invalid data', () => {
            const result = PlanValidator.validatePlan(
                '',
                -100,
                0
            );
            expect(result.isValid).toBe(false);
            expect(result.errors.planName).toBeDefined();
            expect(result.errors.amount).toBeDefined();
            expect(result.errors.months).toBeDefined();
        });

        it('should return invalid with specific field errors', () => {
            const result = PlanValidator.validatePlan(
                'Valid Name',
                -100,
                12
            );
            expect(result.isValid).toBe(false);
            expect(result.errors.planName).toBeUndefined();
            expect(result.errors.amount).toBeDefined();
            expect(result.errors.months).toBeUndefined();
        });
    });
});


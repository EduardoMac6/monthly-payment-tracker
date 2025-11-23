import { describe, it, expect } from 'vitest';
import { formatCurrency, formatMonthsText, formatOwnerText } from './formatters.js';
import type { Plan } from '../types/index.js';

describe('Formatters', () => {
    describe('formatCurrency', () => {
        it('should format positive numbers as currency', () => {
            const result = formatCurrency(1000);
            expect(result).toContain('1,000');
            expect(result).toContain('$');
        });

        it('should format large numbers with thousands separator', () => {
            const result = formatCurrency(1000000);
            expect(result).toContain('1,000,000');
        });

        it('should format decimal amounts', () => {
            const result = formatCurrency(1234.56);
            expect(result).toContain('1,234.56');
        });

        it('should format zero', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0');
        });
    });

    describe('formatMonthsText', () => {
        it('should format one-time plan as "One-time" when not paid', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 'one-time',
                monthlyPayment: 1000,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatMonthsText(plan, 0);
            expect(result).toBe('One-time');
        });

        it('should format one-time plan as "Paid" when paid', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 'one-time',
                monthlyPayment: 1000,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatMonthsText(plan, 1);
            expect(result).toBe('Paid');
        });

        it('should format monthly plan with paid/total format', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 12000,
                numberOfMonths: 12,
                monthlyPayment: 1000,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatMonthsText(plan, 5);
            expect(result).toBe('5 / 12 months');
        });

        it('should format monthly plan with zero paid months', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 12000,
                numberOfMonths: 12,
                monthlyPayment: 1000,
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatMonthsText(plan, 0);
            expect(result).toBe('0 / 12 months');
        });
    });

    describe('formatOwnerText', () => {
        it('should return "My Debt" for self-owned plans', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 12,
                monthlyPayment: 100,
                debtOwner: 'self',
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatOwnerText(plan);
            expect(result).toBe('My Debt');
        });

        it('should return "Receivable" for other-owned plans', () => {
            const plan: Plan = {
                id: '1',
                planName: 'Test',
                totalAmount: 1000,
                numberOfMonths: 12,
                monthlyPayment: 100,
                debtOwner: 'other',
                createdAt: new Date().toISOString(),
                isActive: true,
            };
            const result = formatOwnerText(plan);
            expect(result).toBe('Receivable');
        });
    });
});


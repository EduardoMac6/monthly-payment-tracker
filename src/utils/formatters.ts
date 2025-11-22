import type { Plan } from '../types/index.js';

/**
 * Currency formatter utility
 * Formats numbers as currency using Mexican Peso format
 */
export const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
});

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount);
}

/**
 * Format months text for display
 * @param plan - The plan to format months for
 * @param paidMonths - Number of paid months
 * @returns Formatted months text
 */
export function formatMonthsText(plan: Plan, paidMonths: number): string {
    if (plan.numberOfMonths === 'one-time') {
        return paidMonths > 0 ? 'Paid' : 'One-time';
    }
    const totalMonths = plan.numberOfMonths;
    return `${paidMonths} / ${totalMonths} months`;
}

/**
 * Format owner text for display
 * @param plan - The plan to format owner for
 * @returns Formatted owner text
 */
export function formatOwnerText(plan: Plan): string {
    return plan.debtOwner === 'other' ? 'Receivable' : 'My Debt';
}


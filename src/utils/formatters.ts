import type { Plan } from '../types/index.js';

/**
 * Currency Formatter Utilities
 *
 * Provides functions to format data for display in the UI.
 * All formatters use Mexican Peso (MXN) format.
 */

/**
 * Currency formatter instance
 * Formats numbers as currency using Mexican Peso format (MXN)
 */
export const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
});

/**
 * Format a number as currency string
 *
 * @param amount - The amount to format (must be a number)
 * @returns Formatted currency string (e.g., "$1,000.00")
 *
 * @example
 * ```typescript
 * formatCurrency(1000) // "$1,000.00"
 * formatCurrency(50000.5) // "$50,000.50"
 * ```
 */
export function formatCurrency(amount: number): string {
    return currencyFormatter.format(amount);
}

/**
 * Format months text for display
 *
 * Formats the payment progress text based on plan type and paid months.
 * For one-time plans, returns "Paid" or "One-time". For monthly plans,
 * returns "X / Y months" format.
 *
 * @param plan - The plan to format months for
 * @param paidMonths - Number of paid months (0 or 1 for one-time plans)
 * @returns Formatted months text
 *
 * @example
 * ```typescript
 * // One-time plan (not paid)
 * formatMonthsText(oneTimePlan, 0) // "One-time"
 *
 * // One-time plan (paid)
 * formatMonthsText(oneTimePlan, 1) // "Paid"
 *
 * // Monthly plan
 * formatMonthsText(monthlyPlan, 5) // "5 / 12 months"
 * ```
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
 *
 * Converts the debtOwner property to a user-friendly display text.
 *
 * @param plan - The plan to format owner for
 * @returns "My Debt" for 'self', "Receivable" for 'other'
 *
 * @example
 * ```typescript
 * formatOwnerText({ debtOwner: 'self' }) // "My Debt"
 * formatOwnerText({ debtOwner: 'other' }) // "Receivable"
 * ```
 */
export function formatOwnerText(plan: Plan): string {
    return plan.debtOwner === 'other' ? 'Receivable' : 'My Debt';
}

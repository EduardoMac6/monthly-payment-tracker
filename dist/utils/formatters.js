/**
 * Utility functions for formatting data
 */
/**
 * Currency formatter for Mexican Peso
 */
export const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
});
/**
 * Format a number as currency
 */
export function formatCurrency(amount) {
    return currencyFormatter.format(amount);
}
/**
 * Format months text for display
 */
export function formatMonthsText(numberOfMonths) {
    return numberOfMonths === 'one-time' ? 'One-time' : `${numberOfMonths} months`;
}

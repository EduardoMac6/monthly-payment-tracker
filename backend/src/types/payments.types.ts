/**
 * Payments Types
 * Type definitions for payment management
 */

export interface PaymentStatusInput {
    status: Array<{
        monthIndex: number;
        status: string;
        amount: number;
        paidAt?: string | null;
    }>;
}

export interface PaymentTotalsInput {
    totalPaid: number;
    remaining: number;
}


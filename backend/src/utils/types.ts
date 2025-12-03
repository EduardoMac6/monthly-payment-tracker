/**
 * Type definitions for API
 */

export interface PlanCreateInput {
    planName: string;
    totalAmount: number;
    numberOfMonths: number | null;
    monthlyPayment: number;
    debtOwner?: 'self' | 'other';
    isActive?: boolean;
}

export interface PlanUpdateInput {
    planName?: string;
    totalAmount?: number;
    numberOfMonths?: number | null;
    monthlyPayment?: number;
    debtOwner?: 'self' | 'other';
    isActive?: boolean;
}

export interface BulkPlansInput {
    plans: Array<PlanCreateInput & { id?: string }>;
}

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

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}


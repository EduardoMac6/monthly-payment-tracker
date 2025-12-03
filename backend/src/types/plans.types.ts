/**
 * Plans Types
 * Type definitions for plan management
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


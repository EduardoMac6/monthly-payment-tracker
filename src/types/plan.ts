/**
 * Plan type definition
 * Represents a payment plan with all its properties
 */
export type Plan = {
    id: string;
    planName: string;
    totalAmount: number;
    numberOfMonths: number | 'one-time';
    monthlyPayment: number;
    debtOwner?: 'self' | 'other'; // Opcional para compatibilidad con planes antiguos
    createdAt: string;
    isActive: boolean;
};

/**
 * Payment status type
 * Represents the status of a payment (paid or pending)
 */
export type PaymentStatus = 'paid' | 'pending' | 'pagado';

/**
 * Totals snapshot type
 * Represents the current totals for a plan
 */
export type TotalsSnapshot = {
    totalPaid: number;
    remaining: number;
};

/**
 * Overview statistics type
 * Represents aggregated statistics across all plans
 */
export type OverviewStats = {
    totalPlans: number;
    totalDebt: number;
    totalPaid: number;
    remaining: number;
    myDebts: {
        total: number;
        paid: number;
        remaining: number;
    };
    receivables: {
        total: number;
        received: number;
        pending: number;
    };
};

/**
 * Plan payment status type
 * Represents payment status information for a specific plan
 */
export type PlanPaymentStatus = {
    totalPaid: number;
    remaining: number;
};


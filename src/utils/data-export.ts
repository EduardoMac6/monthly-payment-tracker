/**
 * Data Export/Import Utilities
 * Functions to export and import payment plan data
 */

import type { Plan, PaymentStatus } from '../types/index.js';
import { PlansService } from '../services/plans/plans.service.js';
import { PaymentsService } from '../services/payments/payments.service.js';
import { StorageFactory } from '../services/storage/storage.factory.js';

export interface ExportData {
    plans: Plan[];
    paymentStatus: Record<string, PaymentStatus[]>;
    paymentTotals: Record<string, { totalPaid: number; remaining: number }>;
    exportDate: string;
    version: string;
}

/**
 * Export all data to JSON
 */
export async function exportToJSON(): Promise<string> {
    const plans = await PlansService.getAllPlans();
    const storage = StorageFactory.create();
    const paymentStatus: Record<string, PaymentStatus[]> = {};
    const paymentTotals: Record<string, { totalPaid: number; remaining: number }> = {};

    // Get payment status for all plans
    for (const plan of plans) {
        try {
            const status = await storage.getPaymentStatus(plan.id);
            paymentStatus[plan.id] = status;
        } catch {
            paymentStatus[plan.id] = [];
        }

        try {
            const totals = await PaymentsService.getPlanPaymentStatus(plan.id, plans);
            paymentTotals[plan.id] = {
                totalPaid: totals.totalPaid,
                remaining: totals.remaining,
            };
        } catch {
            paymentTotals[plan.id] = { totalPaid: 0, remaining: plan.totalAmount };
        }
    }

    const exportData: ExportData = {
        plans,
        paymentStatus,
        paymentTotals,
        exportDate: new Date().toISOString(),
        version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Export all data to CSV
 */
export async function exportToCSV(): Promise<string> {
    const plans = await PlansService.getAllPlans();

    // CSV Header
    const headers = [
        'Plan ID',
        'Plan Name',
        'Total Amount',
        'Monthly Payment',
        'Number of Months',
        'Debt Owner',
        'Total Paid',
        'Remaining',
        'Status',
    ];

    const rows: string[][] = [headers];

    // Add data rows
    for (const plan of plans) {
        try {
            const totals = await PaymentsService.getPlanPaymentStatus(plan.id, plans);
            const status = totals.totalPaid === plan.totalAmount ? 'Completed' : 'In Progress';

            rows.push([
                plan.id,
                plan.planName,
                plan.totalAmount.toString(),
                plan.monthlyPayment.toString(),
                plan.numberOfMonths === 'one-time' ? 'One-time' : plan.numberOfMonths.toString(),
                plan.debtOwner === 'self' ? 'My Debt' : 'Receivable',
                totals.totalPaid.toString(),
                totals.remaining.toString(),
                status,
            ]);
        } catch {
            // If error, add plan without payment data
            rows.push([
                plan.id,
                plan.planName,
                plan.totalAmount.toString(),
                plan.monthlyPayment.toString(),
                plan.numberOfMonths === 'one-time' ? 'One-time' : plan.numberOfMonths.toString(),
                plan.debtOwner === 'self' ? 'My Debt' : 'Receivable',
                '0',
                plan.totalAmount.toString(),
                'Not Started',
            ]);
        }
    }

    // Convert to CSV string
    return rows
        .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
export async function importFromJSON(
    jsonString: string
): Promise<{ success: boolean; message: string }> {
    try {
        const data: ExportData = JSON.parse(jsonString);

        // Validate data structure
        if (!data.plans || !Array.isArray(data.plans)) {
            return { success: false, message: 'Invalid data format: plans array is missing' };
        }

        if (!data.version) {
            return { success: false, message: 'Invalid data format: version is missing' };
        }

        const storage = StorageFactory.create();

        // Import plans
        for (const plan of data.plans) {
            try {
                // Ensure debtOwner has a default value
                const planData = {
                    planName: plan.planName,
                    totalAmount: plan.totalAmount,
                    numberOfMonths: plan.numberOfMonths,
                    debtOwner: plan.debtOwner || 'self',
                };
                await PlansService.createPlan(planData);
            } catch {
                // Plan might already exist, try to update
                try {
                    await PlansService.updatePlan(plan.id, plan);
                } catch {
                    // Skip if can't create or update
                    console.warn(`Failed to import plan: ${plan.planName}`);
                }
            }
        }

        // Import payment status
        if (data.paymentStatus) {
            for (const [planId, status] of Object.entries(data.paymentStatus)) {
                try {
                    // Convert string[] to PaymentStatus[]
                    const paymentStatusArray = status.map((s) => {
                        if (s === 'paid' || s === 'pending' || s === 'pagado') {
                            return s as PaymentStatus;
                        }
                        return s === 'paid' || s === 'pagado' ? 'paid' : 'pending';
                    });
                    await storage.savePaymentStatus(planId, paymentStatusArray);
                } catch {
                    console.warn(`Failed to import payment status for plan: ${planId}`);
                }
            }
        }

        // Import payment totals (if available)
        if (data.paymentTotals) {
            for (const [planId, totals] of Object.entries(data.paymentTotals)) {
                try {
                    const plans = await PlansService.getAllPlans();
                    await PaymentsService.savePaymentStatus(
                        planId,
                        [], // Status array will be calculated from totals if needed
                        totals,
                        plans
                    );
                } catch {
                    console.warn(`Failed to import payment totals for plan: ${planId}`);
                }
            }
        }

        return { success: true, message: `Successfully imported ${data.plans.length} plan(s)` };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to parse JSON file',
        };
    }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result && typeof e.target.result === 'string') {
                resolve(e.target.result);
            } else {
                reject(new Error('Failed to read file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
}

import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types';
import type { IStorageService } from './storage.interface';
import { StorageError, ErrorHandler } from '../../utils/errors.js';
import { getSupabase } from '../../config/supabase.config.js';

/**
 * Supabase Storage Service
 *
 * This service implements IStorageService using Supabase
 * instead of a custom API backend. This provides:
 * - Multi-device synchronization
 * - Cloud backup
 * - Multi-user support
 * - Real-time capabilities
 * - Built-in authentication
 *
 * To use this service, set VITE_STORAGE_TYPE='supabase' in environment variables
 */
export class SupabaseStorageService implements IStorageService {
    private readonly ACTIVE_PLAN_ID_KEY = 'debtLiteActivePlanId';

    /**
     * Get all plans from Supabase
     * @returns Promise that resolves to array of plans
     */
    async getPlans(): Promise<Plan[]> {
        try {
            const { data, error } = await getSupabase()
                .from('plans')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            // Transform Supabase data to Plan format
            return (data || []).map(this.transformPlanFromDB);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.getPlans');
            throw new StorageError(
                'Failed to retrieve plans from Supabase',
                'No se pudieron cargar tus planes de pago. Por favor, verifica tu conexión.',
                err
            );
        }
    }

    /**
     * Save a plan to Supabase
     * @param plan - Plan to save
     * @returns Promise that resolves when plan is saved
     */
    async savePlan(plan: Plan): Promise<void> {
        try {
            const planData = this.transformPlanToDB(plan);

            // Check if plan exists
            const { data: existing } = await getSupabase()
                .from('plans')
                .select('id')
                .eq('id', plan.id)
                .single();

            if (existing) {
                // Update existing plan
                const { error } = await getSupabase()
                    .from('plans')
                    .update(planData)
                    .eq('id', plan.id);

                if (error) {
                    throw new Error(error.message);
                }
            } else {
                // Create new plan
                const { error } = await getSupabase().from('plans').insert([planData]);

                if (error) {
                    throw new Error(error.message);
                }
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.savePlan');
            throw new StorageError(
                'Failed to save plan to Supabase',
                'No se pudo guardar tu plan de pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Save multiple plans to Supabase
     * @param plans - Array of plans to save
     * @returns Promise that resolves when plans are saved
     */
    async savePlans(plans: Plan[]): Promise<void> {
        try {
            // Get current user's plans to determine which to update vs insert
            const { data: existingPlans } = await getSupabase().from('plans').select('id');

            const existingIds = new Set((existingPlans || []).map((p) => p.id));

            const toInsert = plans
                .filter((p) => !existingIds.has(p.id))
                .map((p) => this.transformPlanToDB(p));

            const toUpdate = plans.filter((p) => existingIds.has(p.id));

            // Insert new plans
            if (toInsert.length > 0) {
                const { error: insertError } = await getSupabase().from('plans').insert(toInsert);

                if (insertError) {
                    throw new Error(insertError.message);
                }
            }

            // Update existing plans
            for (const plan of toUpdate) {
                const planData = this.transformPlanToDB(plan);
                const { error: updateError } = await getSupabase()
                    .from('plans')
                    .update(planData)
                    .eq('id', plan.id);

                if (updateError) {
                    throw new Error(updateError.message);
                }
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.savePlans');
            throw new StorageError(
                'Failed to save plans to Supabase',
                'No se pudieron guardar los planes. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete a plan from Supabase
     * @param planId - ID of plan to delete
     * @returns Promise that resolves when plan is deleted
     */
    async deletePlan(planId: string): Promise<void> {
        try {
            // Delete payment data first (cascade should handle this, but being explicit)
            await this.deletePaymentData(planId);

            // Delete the plan (cascade will delete related records)
            const { error } = await getSupabase().from('plans').delete().eq('id', planId);

            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.deletePlan');
            throw new StorageError(
                'Failed to delete plan from Supabase',
                'No se pudo eliminar el plan. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Get active plan ID
     * Uses localStorage as fallback since this is UI state
     * @returns Promise that resolves to active plan ID or null
     */
    async getActivePlanId(): Promise<string | null> {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(this.ACTIVE_PLAN_ID_KEY);
        }
        return null;
    }

    /**
     * Set active plan ID
     * Uses localStorage as fallback since this is UI state
     * @param planId - Plan ID to set as active
     * @returns Promise that resolves when active plan ID is set
     */
    async setActivePlanId(planId: string): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.ACTIVE_PLAN_ID_KEY, planId);
        }
    }

    /**
     * Get active plan from Supabase
     * @returns Promise that resolves to active plan or null
     */
    async getActivePlan(): Promise<Plan | null> {
        try {
            const activePlanId = await this.getActivePlanId();
            if (activePlanId) {
                const { data, error } = await getSupabase()
                    .from('plans')
                    .select('*')
                    .eq('id', activePlanId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    // PGRST116 = not found
                    throw new Error(error.message);
                }

                if (data) {
                    return this.transformPlanFromDB(data);
                }
            }

            // Fallback: get all plans and find active one
            const plans = await this.getPlans();
            const activePlan = plans.find((p) => p.isActive);
            return activePlan || (plans.length > 0 ? plans[plans.length - 1] : null);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.getActivePlan');
            return null;
        }
    }

    /**
     * Get payment status for a plan from Supabase
     * @param planId - Plan ID
     * @returns Promise that resolves to array of payment statuses
     */
    async getPaymentStatus(planId: string): Promise<PaymentStatus[]> {
        try {
            const { data, error } = await getSupabase()
                .from('payment_statuses')
                .select('*')
                .eq('plan_id', planId)
                .order('month_index', { ascending: true });

            if (error) {
                throw new Error(error.message);
            }

            // Transform to PaymentStatus array
            if (!data || data.length === 0) {
                return [];
            }

            // Get plan to know how many months
            const { data: planData } = await getSupabase()
                .from('plans')
                .select('number_of_months')
                .eq('id', planId)
                .single();

            const numberOfMonths = planData?.number_of_months || 0;

            // Create array with correct length
            const statusArray: PaymentStatus[] = new Array(numberOfMonths).fill('pending');

            data.forEach((item: any) => {
                const status = item.status === 'paid' ? 'paid' : 'pending';
                if (item.month_index < numberOfMonths) {
                    statusArray[item.month_index] = status;
                }
            });

            return statusArray;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.getPaymentStatus');
            return [];
        }
    }

    /**
     * Save payment status for a plan to Supabase
     * @param planId - Plan ID
     * @param status - Array of payment statuses
     * @returns Promise that resolves when payment status is saved
     */
    async savePaymentStatus(planId: string, status: PaymentStatus[]): Promise<void> {
        try {
            // Get plan to calculate monthly payment amount
            const { data: planData } = await getSupabase()
                .from('plans')
                .select('monthly_payment')
                .eq('id', planId)
                .single();

            const monthlyAmount = planData?.monthly_payment || 0;

            // Delete existing payment statuses for this plan
            await getSupabase().from('payment_statuses').delete().eq('plan_id', planId);

            // Transform PaymentStatus array to database format
            const statusData = status
                .map((s, index) => ({
                    plan_id: planId,
                    month_index: index,
                    status: s === 'pagado' || s === 'paid' ? 'paid' : 'pending',
                    amount: monthlyAmount,
                    paid_at: s === 'paid' || s === 'pagado' ? new Date().toISOString() : null,
                }))
                .filter((s) => s.status === 'paid'); // Only save paid statuses to reduce data

            // Insert new payment statuses
            if (statusData.length > 0) {
                const { error } = await getSupabase().from('payment_statuses').insert(statusData);

                if (error) {
                    throw new Error(error.message);
                }
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.savePaymentStatus');
            throw new StorageError(
                'Failed to save payment status to Supabase',
                'No se pudo guardar el estado del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Get payment totals for a plan from Supabase
     * @param planId - Plan ID
     * @returns Promise that resolves to payment totals or null
     */
    async getPaymentTotals(planId: string): Promise<TotalsSnapshot | null> {
        try {
            const { data, error } = await getSupabase()
                .from('payment_totals')
                .select('*')
                .eq('plan_id', planId)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = not found
                throw new Error(error.message);
            }

            if (!data) {
                return null;
            }

            return {
                totalPaid: data.total_paid || 0,
                remaining: data.remaining || 0,
            };
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.getPaymentTotals');
            return null;
        }
    }

    /**
     * Save payment totals for a plan to Supabase
     * @param planId - Plan ID
     * @param totals - Payment totals
     * @returns Promise that resolves when payment totals is saved
     */
    async savePaymentTotals(planId: string, totals: TotalsSnapshot): Promise<void> {
        try {
            // Check if totals exist
            const { data: existing } = await getSupabase()
                .from('payment_totals')
                .select('id')
                .eq('plan_id', planId)
                .single();

            const totalsData = {
                plan_id: planId,
                total_paid: totals.totalPaid,
                remaining: totals.remaining,
            };

            if (existing) {
                // Update existing totals
                const { error } = await getSupabase()
                    .from('payment_totals')
                    .update(totalsData)
                    .eq('plan_id', planId);

                if (error) {
                    throw new Error(error.message);
                }
            } else {
                // Insert new totals
                const { error } = await getSupabase().from('payment_totals').insert([totalsData]);

                if (error) {
                    throw new Error(error.message);
                }
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.savePaymentTotals');
            throw new StorageError(
                'Failed to save payment totals to Supabase',
                'No se pudo guardar los totales del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete payment data for a plan from Supabase
     * @param planId - Plan ID
     * @returns Promise that resolves when payment data is deleted
     */
    async deletePaymentData(planId: string): Promise<void> {
        try {
            // Delete payment statuses
            await getSupabase().from('payment_statuses').delete().eq('plan_id', planId);

            // Delete payment totals
            await getSupabase().from('payment_totals').delete().eq('plan_id', planId);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'SupabaseStorageService.deletePaymentData');
            // Don't throw - deletion is best effort
        }
    }

    /**
     * Clear active plan ID
     * @returns Promise that resolves when active plan ID is cleared
     */
    async clearActivePlanId(): Promise<void> {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(this.ACTIVE_PLAN_ID_KEY);
        }
    }

    /**
     * Transform Plan from database format to app format
     */
    private transformPlanFromDB(dbPlan: any): Plan {
        return {
            id: dbPlan.id,
            planName: dbPlan.plan_name,
            totalAmount: dbPlan.total_amount,
            numberOfMonths: dbPlan.number_of_months ?? 'one-time',
            monthlyPayment: dbPlan.monthly_payment,
            debtOwner: dbPlan.debt_owner || 'self',
            createdAt: dbPlan.created_at,
            isActive: dbPlan.is_active ?? true,
        };
    }

    /**
     * Transform Plan from app format to database format
     */
    private transformPlanToDB(plan: Plan): any {
        return {
            id: plan.id,
            plan_name: plan.planName,
            total_amount: plan.totalAmount,
            number_of_months: plan.numberOfMonths === 'one-time' ? null : plan.numberOfMonths,
            monthly_payment: plan.monthlyPayment,
            debt_owner: plan.debtOwner || 'self',
            is_active: plan.isActive ?? true,
        };
    }
}

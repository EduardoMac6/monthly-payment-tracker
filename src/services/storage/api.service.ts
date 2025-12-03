import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types';
import type { IStorageService } from './storage.interface';
import { StorageError, ErrorHandler } from '../../utils/errors.js';
import { HttpClient, HttpError } from '../api/http.client.js';
import { authService } from '../auth/auth.service.js';

/**
 * API Storage Service
 *
 * This service implements IStorageService using HTTP API calls
 * instead of localStorage. This allows for:
 * - Multi-device synchronization
 * - Cloud backup
 * - Multi-user support
 *
 * To use this service, set VITE_STORAGE_TYPE='api' in environment variables
 *
 * @example
 * // In .env or window.__ENV__:
 * VITE_STORAGE_TYPE=api
 * VITE_API_URL=http://localhost:3000/api
 */
export class ApiStorageService implements IStorageService {
    private http: HttpClient;
    private readonly ACTIVE_PLAN_ID_KEY = 'debtLiteActivePlanId';

    constructor(baseURL: string) {
        this.http = new HttpClient({
            baseURL,
            timeout: 30000,
            retries: 3,
            retryDelay: 1000,
        });

        // Add request interceptor for authentication
        this.http.addRequestInterceptor((config) => {
            const token = authService.getToken();
            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                };
            }
            return config;
        });

        // Add response interceptor for handling auth errors
        this.http.addResponseInterceptor(async (response) => {
            if (response.status === 401) {
                // Token expired or invalid, clear auth
                authService.clearAuth();
                // Optionally redirect to login (handled by app)
            }
            return response;
        });

        // Add request interceptor for logging (optional, can be removed in production)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            this.http.addRequestInterceptor((config) => {
                console.warn(`[ApiStorageService] ${config.method} ${config.url}`);
                return config;
            });
        }
    }

    /**
     * Get all plans from API
     * @returns Promise that resolves to array of plans
     */
    async getPlans(): Promise<Plan[]> {
        try {
            const response = await this.http.get<{ success: boolean; data: Plan[] }>('/plans');
            const plans = response.data || [];
            return Array.isArray(plans) ? plans : [];
        } catch (error) {
            const err = this.handleHttpError(error, 'getPlans');
            throw new StorageError(
                'Failed to retrieve plans from API',
                'No se pudieron cargar tus planes de pago. Por favor, verifica tu conexión.',
                err
            );
        }
    }

    /**
     * Save a plan to API
     * @param plan - Plan to save
     * @returns Promise that resolves when plan is saved
     */
    async savePlan(plan: Plan): Promise<void> {
        try {
            // Check if plan exists (update) or is new (create)
            const existingPlans = await this.getPlans();
            const exists = existingPlans.some((p) => p.id === plan.id);

            if (exists) {
                // Update existing plan
                await this.http.put<{ success: boolean }>(`/plans/${plan.id}`, plan);
            } else {
                // Create new plan
                await this.http.post<{ success: boolean }>('/plans', plan);
            }
        } catch (error) {
            const err = this.handleHttpError(error, 'savePlan');
            throw new StorageError(
                'Failed to save plan to API',
                'No se pudo guardar tu plan de pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Save multiple plans to API
     * @param plans - Array of plans to save
     * @returns Promise that resolves when plans are saved
     */
    async savePlans(plans: Plan[]): Promise<void> {
        try {
            await this.http.post<{ success: boolean }>('/plans/bulk', { plans });
        } catch (error) {
            const err = this.handleHttpError(error, 'savePlans');
            throw new StorageError(
                'Failed to save plans to API',
                'No se pudieron guardar los planes. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete a plan from API
     * @param planId - ID of plan to delete
     * @returns Promise that resolves when plan is deleted
     */
    async deletePlan(planId: string): Promise<void> {
        try {
            await this.http.delete<{ success: boolean }>(`/plans/${planId}`);
            // Also delete payment data
            await this.deletePaymentData(planId);
        } catch (error) {
            const err = this.handleHttpError(error, 'deletePlan');
            throw new StorageError(
                'Failed to delete plan from API',
                'No se pudo eliminar el plan. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Get active plan ID
     * Uses localStorage as fallback since this is UI state, not server state
     * @returns Promise that resolves to active plan ID or null
     */
    async getActivePlanId(): Promise<string | null> {
        // Active plan ID is typically UI state, so we use localStorage as fallback
        // In a multi-device scenario, this could be stored in user preferences on the server
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(this.ACTIVE_PLAN_ID_KEY);
        }
        return null;
    }

    /**
     * Set active plan ID
     * Uses localStorage as fallback since this is UI state, not server state
     * @param planId - Plan ID to set as active
     * @returns Promise that resolves when active plan ID is set
     */
    async setActivePlanId(planId: string): Promise<void> {
        // Active plan ID is typically UI state, so we use localStorage
        // In a multi-device scenario, this could be stored in user preferences on the server
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(this.ACTIVE_PLAN_ID_KEY, planId);
        }
    }

    /**
     * Get active plan from API
     * @returns Promise that resolves to active plan or null
     */
    async getActivePlan(): Promise<Plan | null> {
        try {
            const activePlanId = await this.getActivePlanId();
            if (activePlanId) {
                const response = await this.http.get<{ success: boolean; data: Plan }>(
                    `/plans/${activePlanId}`
                );
                return response.data || null;
            }

            // Fallback: get all plans and find active one
            const plans = await this.getPlans();
            const activePlan = plans.find((p) => p.isActive);
            return activePlan || (plans.length > 0 ? plans[plans.length - 1] : null);
        } catch (error) {
            const err = this.handleHttpError(error, 'getActivePlan');
            ErrorHandler.logError(err, 'ApiStorageService.getActivePlan');
            // Return null instead of throwing for graceful degradation
            return null;
        }
    }

    /**
     * Get payment status for a plan from API
     * @param planId - Plan ID
     * @returns Promise that resolves to array of payment statuses
     */
    async getPaymentStatus(planId: string): Promise<PaymentStatus[]> {
        try {
            const response = await this.http.get<{ success: boolean; data: PaymentStatus[] }>(
                `/plans/${planId}/payments`
            );
            const status = response.data || [];
            // Backend returns array of strings, convert 'paid' to 'paid' or 'pagado' if needed
            return Array.isArray(status)
                ? status.map((s) => (s === 'paid' ? 'paid' : 'pending') as PaymentStatus)
                : [];
        } catch (error) {
            const err = this.handleHttpError(error, 'getPaymentStatus');
            ErrorHandler.logError(err, 'ApiStorageService.getPaymentStatus');
            // Return empty array instead of throwing for graceful degradation
            return [];
        }
    }

    /**
     * Save payment status for a plan to API
     * @param planId - Plan ID
     * @param status - Array of payment statuses
     * @returns Promise that resolves when payment status is saved
     */
    async savePaymentStatus(planId: string, status: PaymentStatus[]): Promise<void> {
        try {
            // Get plan to calculate monthly payment amount
            const plans = await this.getPlans();
            const plan = plans.find((p) => p.id === planId);
            const monthlyAmount = plan?.monthlyPayment || 0;

            // Convert PaymentStatus array to format expected by backend
            const statusData = status.map((s, index) => ({
                monthIndex: index,
                status: s === 'pagado' ? 'paid' : s === 'paid' ? 'paid' : 'pending',
                amount: monthlyAmount,
                paidAt: s === 'paid' || s === 'pagado' ? new Date().toISOString() : null,
            }));
            await this.http.put<{ success: boolean }>(`/plans/${planId}/payments`, {
                status: statusData,
            });
        } catch (error) {
            const err = this.handleHttpError(error, 'savePaymentStatus');
            throw new StorageError(
                'Failed to save payment status to API',
                'No se pudo guardar el estado del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Get payment totals for a plan from API
     * @param planId - Plan ID
     * @returns Promise that resolves to payment totals or null
     */
    async getPaymentTotals(planId: string): Promise<TotalsSnapshot | null> {
        try {
            const response = await this.http.get<{ success: boolean; data: TotalsSnapshot | null }>(
                `/plans/${planId}/totals`
            );
            return response.data || null;
        } catch (error) {
            const err = this.handleHttpError(error, 'getPaymentTotals');
            ErrorHandler.logError(err, 'ApiStorageService.getPaymentTotals');
            // Return null instead of throwing for graceful degradation
            return null;
        }
    }

    /**
     * Save payment totals for a plan to API
     * @param planId - Plan ID
     * @param totals - Payment totals
     * @returns Promise that resolves when payment totals are saved
     */
    async savePaymentTotals(planId: string, totals: TotalsSnapshot): Promise<void> {
        try {
            await this.http.put<{ success: boolean }>(`/plans/${planId}/totals`, totals);
        } catch (error) {
            const err = this.handleHttpError(error, 'savePaymentTotals');
            throw new StorageError(
                'Failed to save payment totals to API',
                'No se pudo guardar los totales del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete payment data for a plan from API
     * @param planId - Plan ID
     * @returns Promise that resolves when payment data is deleted
     */
    async deletePaymentData(planId: string): Promise<void> {
        try {
            await this.http.delete<{ success: boolean }>(`/plans/${planId}/payments`);
            // Totals are deleted automatically when plan is deleted (cascade)
        } catch (error) {
            const err = this.handleHttpError(error, 'deletePaymentData');
            ErrorHandler.logError(err, 'ApiStorageService.deletePaymentData');
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
     * Handle HTTP errors and convert to appropriate Error type
     * @param error - Error from HTTP request
     * @param context - Context where error occurred
     * @returns Error instance
     */
    private handleHttpError(error: unknown, context: string): Error {
        if (error instanceof HttpError) {
            ErrorHandler.logError(error, `ApiStorageService.${context}`);
            return error;
        }

        if (error instanceof Error) {
            ErrorHandler.logError(error, `ApiStorageService.${context}`);
            return error;
        }

        const unknownError = new Error('Unknown error occurred');
        ErrorHandler.logError(unknownError, `ApiStorageService.${context}`);
        return unknownError;
    }
}

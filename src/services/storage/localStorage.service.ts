import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types/index.js';
import type { IStorageService } from './storage.interface.js';
import { StorageError, ErrorHandler } from '../../utils/errors.js';
import { sanitizeStoredData, validateDataSize } from '../../utils/sanitizer.js';

/**
 * LocalStorage service implementation
 * Implements IStorageService using browser's localStorage
 * All methods are async to match the interface, even though localStorage is synchronous
 */
export class LocalStorageService implements IStorageService {
    private static readonly PLANS_KEY = 'debtLitePlans';
    private static readonly ACTIVE_PLAN_ID_KEY = 'debtLiteActivePlanId';
    private static readonly PAYMENT_STATUS_PREFIX = 'paymentStatus_';
    private static readonly PAYMENT_TOTALS_PREFIX = 'paymentTotals_';

    /**
     * Get all plans from localStorage
     * @returns Promise that resolves to array of plans
     */
    async getPlans(): Promise<Plan[]> {
        try {
            const plansJson = localStorage.getItem(LocalStorageService.PLANS_KEY);
            if (!plansJson) {
                return [];
            }
            const plans = JSON.parse(plansJson) as Plan[];

            // Sanitize loaded data
            const sanitizedPlans = sanitizeStoredData<Plan[]>(plans, 'array');
            if (!sanitizedPlans) {
                throw new Error('Invalid plans data format');
            }

            // Sanitize each plan's name
            return sanitizedPlans.map((plan) => ({
                ...plan,
                planName: plan.planName
                    ? sanitizeStoredData<string>(plan.planName, 'string') || plan.planName
                    : plan.planName,
            }));
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'LocalStorageService.getPlans');

            // Check for JSON parse errors
            if (err.message.includes('JSON')) {
                throw new StorageError(
                    'Failed to parse plans data',
                    'Los datos guardados están corruptos. Por favor, limpia el almacenamiento del navegador.',
                    err
                );
            }

            throw new StorageError(
                'Failed to retrieve plans from storage',
                'No se pudieron cargar tus planes de pago. Por favor, recarga la página.',
                err
            );
        }
    }

    /**
     * Save a plan
     * @param plan - Plan to save
     * @returns Promise that resolves when plan is saved
     */
    async savePlan(plan: Plan): Promise<void> {
        const plans = await this.getPlans();
        const existingIndex = plans.findIndex((p) => p.id === plan.id);

        if (existingIndex >= 0) {
            plans[existingIndex] = plan;
        } else {
            plans.push(plan);
        }

        await this.savePlans(plans);
    }

    /**
     * Save multiple plans to localStorage
     * @param plans - Array of plans to save
     * @returns Promise that resolves when plans are saved
     */
    async savePlans(plans: Plan[]): Promise<void> {
        try {
            // Validate data size before saving (max 5MB)
            if (!validateDataSize(plans, 5120)) {
                throw new StorageError(
                    'Data size exceeds limit',
                    'Los datos son demasiado grandes. Por favor, elimina algunos planes.',
                    new Error('Data size validation failed')
                );
            }

            localStorage.setItem(LocalStorageService.PLANS_KEY, JSON.stringify(plans));
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');

            // Check if it's a quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                throw new StorageError(
                    'Storage quota exceeded',
                    'El almacenamiento está lleno. Por favor, elimina algunos planes o limpia los datos del navegador.',
                    error
                );
            }

            ErrorHandler.logError(err, 'LocalStorageService.savePlans');
            throw new StorageError(
                'Failed to save plans to storage',
                'No se pudo guardar tu plan de pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete a plan
     * @param planId - ID of plan to delete
     * @returns Promise that resolves when plan is deleted
     */
    async deletePlan(planId: string): Promise<void> {
        const plans = await this.getPlans();
        const remainingPlans = plans.filter((p) => p.id !== planId);

        if (remainingPlans.length === plans.length) {
            throw new Error(`Plan with ID ${planId} not found`);
        }

        await this.savePlans(remainingPlans);
        await this.deletePaymentData(planId);
    }

    /**
     * Get active plan ID from localStorage
     * @returns Promise that resolves to active plan ID or null
     */
    async getActivePlanId(): Promise<string | null> {
        return localStorage.getItem(LocalStorageService.ACTIVE_PLAN_ID_KEY);
    }

    /**
     * Set active plan ID in localStorage
     * @param planId - Plan ID to set as active
     * @returns Promise that resolves when active plan ID is set
     */
    async setActivePlanId(planId: string): Promise<void> {
        localStorage.setItem(LocalStorageService.ACTIVE_PLAN_ID_KEY, planId);
    }

    /**
     * Get active plan from localStorage
     * @returns Promise that resolves to active plan or null
     */
    async getActivePlan(): Promise<Plan | null> {
        const plans = await this.getPlans();
        const activePlanId = await this.getActivePlanId();

        if (activePlanId) {
            const plan = plans.find((p) => p.id === activePlanId);
            if (plan) {
                return plan;
            }
        }

        // Fallback: buscar el primer plan activo
        const activePlan = plans.find((p) => p.isActive);
        return activePlan || (plans.length > 0 ? plans[plans.length - 1] : null);
    }

    /**
     * Get payment status for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves to array of payment statuses
     */
    async getPaymentStatus(planId: string): Promise<PaymentStatus[]> {
        try {
            const savedStatus = localStorage.getItem(
                `${LocalStorageService.PAYMENT_STATUS_PREFIX}${planId}`
            );
            if (!savedStatus) {
                return [];
            }
            return JSON.parse(savedStatus) as PaymentStatus[];
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'LocalStorageService.getPaymentStatus');

            // If JSON parse error, return empty array (data might be corrupted)
            if (err.message.includes('JSON')) {
                console.warn('Corrupted payment status data, returning empty array');
            }

            return [];
        }
    }

    /**
     * Save payment status for a plan
     * @param planId - Plan ID
     * @param status - Array of payment statuses
     * @returns Promise that resolves when payment status is saved
     */
    async savePaymentStatus(planId: string, status: PaymentStatus[]): Promise<void> {
        try {
            localStorage.setItem(
                `${LocalStorageService.PAYMENT_STATUS_PREFIX}${planId}`,
                JSON.stringify(status)
            );
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');

            // Check if it's a quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                throw new StorageError(
                    'Storage quota exceeded',
                    'El almacenamiento está lleno. Por favor, limpia los datos del navegador.',
                    error
                );
            }

            ErrorHandler.logError(err, 'LocalStorageService.savePaymentStatus');
            throw new StorageError(
                'Failed to save payment status',
                'No se pudo guardar el estado del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Get payment totals for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves to payment totals or null
     */
    async getPaymentTotals(planId: string): Promise<TotalsSnapshot | null> {
        try {
            const savedTotals = localStorage.getItem(
                `${LocalStorageService.PAYMENT_TOTALS_PREFIX}${planId}`
            );
            if (!savedTotals) {
                return null;
            }
            return JSON.parse(savedTotals) as TotalsSnapshot;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            ErrorHandler.logError(err, 'LocalStorageService.getPaymentTotals');

            // If JSON parse error, return null (data might be corrupted)
            if (err.message.includes('JSON')) {
                console.warn('Corrupted payment totals data, returning null');
            }

            return null;
        }
    }

    /**
     * Save payment totals for a plan
     * @param planId - Plan ID
     * @param totals - Payment totals
     * @returns Promise that resolves when payment totals are saved
     */
    async savePaymentTotals(planId: string, totals: TotalsSnapshot): Promise<void> {
        try {
            localStorage.setItem(
                `${LocalStorageService.PAYMENT_TOTALS_PREFIX}${planId}`,
                JSON.stringify(totals)
            );
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');

            // Check if it's a quota exceeded error
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                throw new StorageError(
                    'Storage quota exceeded',
                    'El almacenamiento está lleno. Por favor, limpia los datos del navegador.',
                    error
                );
            }

            ErrorHandler.logError(err, 'LocalStorageService.savePaymentTotals');
            throw new StorageError(
                'Failed to save payment totals',
                'No se pudo guardar los totales del pago. Por favor, intenta de nuevo.',
                err
            );
        }
    }

    /**
     * Delete payment data for a plan
     * @param planId - Plan ID
     * @returns Promise that resolves when payment data is deleted
     */
    async deletePaymentData(planId: string): Promise<void> {
        localStorage.removeItem(`${LocalStorageService.PAYMENT_STATUS_PREFIX}${planId}`);
        localStorage.removeItem(`${LocalStorageService.PAYMENT_TOTALS_PREFIX}${planId}`);
    }

    /**
     * Clear active plan ID
     * @returns Promise that resolves when active plan ID is cleared
     */
    async clearActivePlanId(): Promise<void> {
        localStorage.removeItem(LocalStorageService.ACTIVE_PLAN_ID_KEY);
    }
}

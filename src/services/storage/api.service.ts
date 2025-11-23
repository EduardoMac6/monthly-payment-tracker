import type { Plan, PaymentStatus, TotalsSnapshot } from '../../types';
import type { IStorageService } from './storage.interface';

/**
 * API Storage Service (FUTURE IMPLEMENTATION)
 *
 * This service will implement IStorageService using HTTP API calls
 * instead of localStorage. This allows for:
 * - Multi-device synchronization
 * - Cloud backup
 * - Multi-user support
 *
 * To use this service, update storage.config.ts to return 'api' instead of 'localStorage'
 *
 * @example
 * // In storage.config.ts:
 * export function getStorageType(): StorageType {
 *   return 'api'; // Switch to API storage
 * }
 */
export class ApiStorageService implements IStorageService {
    private _baseURL: string;

    constructor(baseURL: string = '') {
        // In the future, this will be read from environment variables
        // this._baseURL = process.env.VITE_API_URL || '';
        this._baseURL = baseURL;
        // _baseURL is stored for future use when methods are implemented
        // It will be used in API calls like: fetch(`${this._baseURL}/api/plans`)
        // Marking as intentionally unused for now (stub implementation)
        void this._baseURL; // Suppress unused variable warning
    }

    async getPlans(): Promise<Plan[]> {
        // TODO: Implement API call
        // const response = await fetch(`${this._baseURL}/api/plans`);
        // return await response.json();
        throw new Error('API storage not yet implemented');
    }

    async savePlan(_plan: Plan): Promise<void> {
        // TODO: Implement API call
        // await fetch(`${this._baseURL}/api/plans`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(plan)
        // });
        throw new Error('API storage not yet implemented');
    }

    async savePlans(_plans: Plan[]): Promise<void> {
        // TODO: Implement API call for bulk save
        throw new Error('API storage not yet implemented');
    }

    async deletePlan(_planId: string): Promise<void> {
        // TODO: Implement API call
        // await fetch(`${this._baseURL}/api/plans/${planId}`, {
        //     method: 'DELETE'
        // });
        throw new Error('API storage not yet implemented');
    }

    async getActivePlanId(): Promise<string | null> {
        // TODO: Implement API call or use localStorage as fallback
        throw new Error('API storage not yet implemented');
    }

    async setActivePlanId(_planId: string): Promise<void> {
        // TODO: Implement API call or use localStorage as fallback
        throw new Error('API storage not yet implemented');
    }

    async getActivePlan(): Promise<Plan | null> {
        // TODO: Implement API call
        throw new Error('API storage not yet implemented');
    }

    async getPaymentStatus(_planId: string): Promise<PaymentStatus[]> {
        // TODO: Implement API call
        // const response = await fetch(`${this._baseURL}/api/plans/${planId}/payments`);
        // return await response.json();
        throw new Error('API storage not yet implemented');
    }

    async savePaymentStatus(_planId: string, _status: PaymentStatus[]): Promise<void> {
        // TODO: Implement API call
        // await fetch(`${this._baseURL}/api/plans/${planId}/payments`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(status)
        // });
        throw new Error('API storage not yet implemented');
    }

    async getPaymentTotals(_planId: string): Promise<TotalsSnapshot | null> {
        // TODO: Implement API call
        throw new Error('API storage not yet implemented');
    }

    async savePaymentTotals(_planId: string, _totals: TotalsSnapshot): Promise<void> {
        // TODO: Implement API call
        throw new Error('API storage not yet implemented');
    }

    async deletePaymentData(_planId: string): Promise<void> {
        // TODO: Implement API call
        throw new Error('API storage not yet implemented');
    }

    async clearActivePlanId(): Promise<void> {
        // TODO: Implement API call or use localStorage as fallback
        throw new Error('API storage not yet implemented');
    }
}

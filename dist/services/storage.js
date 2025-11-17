/**
 * Storage service for managing localStorage operations
 */
const PLANS_KEY = 'debtLitePlans';
const ACTIVE_PLAN_ID_KEY = 'debtLiteActivePlanId';
const THEME_KEY = 'debtLiteTheme';
export class StorageService {
    /**
     * Get item from localStorage
     */
    static getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    }
    /**
     * Set item in localStorage
     */
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (error) {
            console.error(`Error writing to localStorage key "${key}":`, error);
        }
    }
    /**
     * Remove item from localStorage
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        }
        catch (error) {
            console.error(`Error removing from localStorage key "${key}":`, error);
        }
    }
    /**
     * Get plans from storage
     */
    static getPlans() {
        return this.getItem(PLANS_KEY) || [];
    }
    /**
     * Save plans to storage
     */
    static savePlans(plans) {
        this.setItem(PLANS_KEY, plans);
    }
    /**
     * Get active plan ID
     */
    static getActivePlanId() {
        return localStorage.getItem(ACTIVE_PLAN_ID_KEY);
    }
    /**
     * Set active plan ID
     */
    static setActivePlanId(planId) {
        localStorage.setItem(ACTIVE_PLAN_ID_KEY, planId);
    }
    /**
     * Remove active plan ID
     */
    static removeActivePlanId() {
        this.removeItem(ACTIVE_PLAN_ID_KEY);
    }
    /**
     * Get payment status for a plan
     */
    static getPaymentStatus(planId) {
        return this.getItem(`paymentStatus_${planId}`) || [];
    }
    /**
     * Save payment status for a plan
     */
    static savePaymentStatus(planId, status) {
        this.setItem(`paymentStatus_${planId}`, status);
    }
    /**
     * Remove payment status for a plan
     */
    static removePaymentStatus(planId) {
        this.removeItem(`paymentStatus_${planId}`);
        this.removeItem(`paymentTotals_${planId}`);
    }
    /**
     * Get payment totals for a plan
     */
    static getPaymentTotals(planId) {
        return this.getItem(`paymentTotals_${planId}`);
    }
    /**
     * Get theme preference
     */
    static getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }
    /**
     * Set theme preference
     */
    static setTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }
}

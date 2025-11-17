/**
 * Service for managing payment plans
 */
import { StorageService } from './storage';
export class PlansService {
    /**
     * Get all plans from storage
     */
    static getAllPlans() {
        return StorageService.getPlans();
    }
    /**
     * Get active plan
     */
    static getActivePlan() {
        const plans = this.getAllPlans();
        if (plans.length === 0) {
            return null;
        }
        const activePlanId = StorageService.getActivePlanId();
        if (activePlanId) {
            const plan = plans.find(p => p.id === activePlanId);
            if (plan) {
                return plan;
            }
        }
        // Fallback: buscar el primer plan activo
        const activePlan = plans.find(p => p.isActive);
        return activePlan || (plans.length > 0 ? plans[plans.length - 1] : null);
    }
    /**
     * Save a new plan
     */
    static savePlan(plan) {
        const plans = this.getAllPlans();
        // Desactivar todos los planes anteriores
        plans.forEach(p => {
            p.isActive = false;
        });
        // Agregar el nuevo plan
        plans.push(plan);
        // Guardar
        StorageService.savePlans(plans);
        StorageService.setActivePlanId(plan.id);
    }
    /**
     * Update a plan
     */
    static updatePlan(planId, updates) {
        const plans = this.getAllPlans();
        const planIndex = plans.findIndex(p => p.id === planId);
        if (planIndex !== -1) {
            plans[planIndex] = { ...plans[planIndex], ...updates };
            StorageService.savePlans(plans);
        }
    }
    /**
     * Delete a plan
     */
    static deletePlan(planId) {
        const plans = this.getAllPlans();
        const filteredPlans = plans.filter(p => p.id !== planId);
        if (filteredPlans.length === plans.length) {
            return false; // Plan no encontrado
        }
        StorageService.savePlans(filteredPlans);
        StorageService.removePaymentStatus(planId);
        // Si se eliminó el plan activo, activar otro
        const activePlanId = StorageService.getActivePlanId();
        if (activePlanId === planId) {
            if (filteredPlans.length > 0) {
                const nextPlan = filteredPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                nextPlan.isActive = true;
                StorageService.setActivePlanId(nextPlan.id);
                StorageService.savePlans(filteredPlans);
            }
            else {
                StorageService.removeActivePlanId();
            }
        }
        return true;
    }
    /**
     * Switch to a different plan
     */
    static switchToPlan(planId) {
        const plans = this.getAllPlans();
        const targetPlan = plans.find(p => p.id === planId);
        if (!targetPlan) {
            return false;
        }
        // Desactivar todos los planes
        plans.forEach(plan => {
            plan.isActive = false;
        });
        // Activar el plan seleccionado
        targetPlan.isActive = true;
        // Guardar cambios
        StorageService.savePlans(plans);
        StorageService.setActivePlanId(planId);
        return true;
    }
    /**
     * Get plans by owner type
     */
    static getPlansByOwner(owner) {
        const plans = this.getAllPlans();
        return plans.filter(plan => {
            if (owner === 'self') {
                return plan.debtOwner === 'self' || !plan.debtOwner;
            }
            return plan.debtOwner === 'other';
        });
    }
}

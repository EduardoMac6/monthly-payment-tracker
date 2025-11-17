/**
 * Plan List Component
 * Handles rendering and interaction with the plans list in the sidebar
 */
import { PlansService } from '../services/plans';
import { formatCurrency, formatMonthsText } from '../utils/formatters';
export class PlanList {
    constructor(container, activePlanId, callbacks) {
        this.container = container;
        this.activePlanId = activePlanId;
        this.onPlanSwitch = callbacks?.onPlanSwitch;
        this.onPlanDelete = callbacks?.onPlanDelete;
    }
    /**
     * Render the plans list
     */
    render() {
        const allPlans = PlansService.getAllPlans();
        if (allPlans.length === 0) {
            this.container.innerHTML = '<p class="text-xs text-deep-black/60 dark:text-pure-white/60 italic">No plans saved yet</p>';
            return;
        }
        // Separate plans by owner
        const myDebts = PlansService.getPlansByOwner('self');
        const receivables = PlansService.getPlansByOwner('other');
        let plansHTML = '';
        // My Debts section
        if (myDebts.length > 0) {
            const sortedMyDebts = this.sortPlans(myDebts);
            plansHTML += this.renderSection('My Debts', sortedMyDebts);
        }
        // Receivables section
        if (receivables.length > 0) {
            const sortedReceivables = this.sortPlans(receivables);
            plansHTML += this.renderSection('Receivables', sortedReceivables);
        }
        this.container.innerHTML = plansHTML;
        this.attachEventListeners();
    }
    /**
     * Sort plans: active first, then by date (newest first)
     */
    sortPlans(plans) {
        return [...plans].sort((a, b) => {
            if (a.isActive && !b.isActive)
                return -1;
            if (!a.isActive && b.isActive)
                return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
    /**
     * Render a section of plans
     */
    renderSection(title, plans) {
        return `
            <div class="mb-4">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-deep-black/60 dark:text-pure-white/60 mb-2">${title}</h3>
                <div class="space-y-2">
                    ${plans.map(plan => this.renderPlan(plan)).join('')}
                </div>
            </div>
        `;
    }
    /**
     * Render a single plan
     */
    renderPlan(plan) {
        const isActive = plan.id === this.activePlanId;
        const monthsText = formatMonthsText(plan.numberOfMonths);
        const formattedAmount = formatCurrency(plan.totalAmount);
        return `
            <div class="relative group">
                <button
                    type="button"
                    data-plan-id="${plan.id}"
                    class="plan-item w-full text-left rounded-lg px-4 py-3 pr-10 transition-all duration-200 ${isActive
            ? 'bg-lime-vibrant text-deep-black shadow-md'
            : 'bg-soft-gray/40 text-deep-black hover:bg-soft-gray dark:bg-charcoal-gray/50 dark:text-pure-white dark:hover:bg-charcoal-gray'}"
                    ${isActive ? 'aria-current="true"' : ''}>
                    <div class="font-semibold text-sm mb-1 truncate">${plan.planName}</div>
                    <div class="text-xs opacity-75">${monthsText} • ${formattedAmount}</div>
                    ${isActive ? '<div class="text-xs mt-1 font-medium">Active</div>' : ''}
                </button>
                <button
                    type="button"
                    data-delete-plan-id="${plan.id}"
                    class="delete-plan-btn absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-graphite"
                    aria-label="Delete plan ${plan.planName}"
                    title="Delete plan">
                    <span class="text-base font-bold leading-none">×</span>
                </button>
            </div>
        `;
    }
    /**
     * Attach event listeners to plan buttons
     */
    attachEventListeners() {
        // Plan switch buttons
        const planButtons = this.container.querySelectorAll('button[data-plan-id]');
        planButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                const target = event.target;
                if (target instanceof HTMLElement && target.closest('.delete-plan-btn')) {
                    return;
                }
                const planId = button.dataset.planId;
                if (planId && planId !== this.activePlanId && this.onPlanSwitch) {
                    this.onPlanSwitch(planId);
                }
            });
        });
        // Delete buttons
        const deleteButtons = this.container.querySelectorAll('button[data-delete-plan-id]');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const planId = button.dataset.deletePlanId;
                if (planId && this.onPlanDelete) {
                    this.onPlanDelete(planId);
                }
            });
        });
    }
}

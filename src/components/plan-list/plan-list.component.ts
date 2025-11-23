import type { Plan } from '../../types/index.js';
import { formatCurrency, formatMonthsText } from '../../utils/formatters.js';
import { PaymentsService } from '../../services/payments/payments.service.js';

/**
 * Plan List Component
 * Handles rendering and interaction with the plan list
 */
export class PlanListComponent {
    private container: HTMLElement | null;
    private activePlan: Plan | null = null;
    private onPlanClick?: (planId: string) => void;
    private onPlanDelete?: (planId: string) => void;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Set the active plan
     * @param plan - Active plan
     */
    setActivePlan(plan: Plan | null): void {
        this.activePlan = plan;
    }

    /**
     * Set callback for plan click
     * @param callback - Callback function
     */
    setOnPlanClick(callback: (planId: string) => void): void {
        this.onPlanClick = callback;
    }

    /**
     * Set callback for plan delete
     * @param callback - Callback function
     */
    setOnPlanDelete(callback: (planId: string) => void): void {
        this.onPlanDelete = callback;
    }

    /**
     * Render the plan list
     * @param allPlans - Array of all plans
     */
    async render(allPlans: Plan[]): Promise<void> {
        if (!this.container) {
            return;
        }

        if (allPlans.length === 0) {
            this.container.innerHTML =
                '<p class="text-xs text-deep-black/60 dark:text-pure-white/60 italic">No plans saved yet</p>';
            return;
        }

        // Separate plans by owner
        const myDebts = allPlans.filter((plan) => plan.debtOwner === 'self' || !plan.debtOwner);
        const otherDebts = allPlans.filter((plan) => plan.debtOwner === 'other');

        // Sort plans: active first, then by date (most recent first)
        const sortPlans = (plans: Plan[]): Plan[] => {
            return [...plans].sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        };

        let plansHTML = '';

        // Section: My Debts
        if (myDebts.length > 0) {
            const sortedMyDebts = sortPlans(myDebts);
            const myDebtsHTML = await Promise.all(
                sortedMyDebts.map((plan) => this.renderPlan(plan))
            );
            plansHTML += `
                <div class="mb-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-deep-black/60 dark:text-pure-white/60 mb-2">My Debts</h3>
                    <div class="space-y-2">
                        ${myDebtsHTML.join('')}
                    </div>
                </div>
            `;
        }

        // Section: Receivables
        if (otherDebts.length > 0) {
            const sortedOtherDebts = sortPlans(otherDebts);
            const otherDebtsHTML = await Promise.all(
                sortedOtherDebts.map((plan) => this.renderPlan(plan))
            );
            plansHTML += `
                <div class="mb-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-deep-black/60 dark:text-pure-white/60 mb-2">Receivables</h3>
                    <div class="space-y-2">
                        ${otherDebtsHTML.join('')}
                    </div>
                </div>
            `;
        }

        this.container.innerHTML = plansHTML;
        this.attachEventListeners();
    }

    /**
     * Render a single plan
     */
    private async renderPlan(plan: Plan): Promise<string> {
        const isActive = this.activePlan !== null && plan.id === this.activePlan.id;
        const paidMonths = await PaymentsService.getPaidMonthsCount(plan.id);
        const monthsText = formatMonthsText(plan, paidMonths);
        const formattedAmount = formatCurrency(plan.totalAmount);

        return `
            <div class="relative group">
                <button
                    type="button"
                    data-plan-id="${plan.id}"
                    class="plan-item w-full text-left rounded-lg px-4 py-3 pr-10 transition-all duration-200 ${
                        isActive
                            ? 'bg-lime-vibrant text-deep-black shadow-md'
                            : 'bg-soft-gray/40 text-deep-black hover:bg-soft-gray dark:bg-charcoal-gray/50 dark:text-pure-white dark:hover:bg-charcoal-gray'
                    }"
                    ${isActive ? 'aria-current="true"' : ''}>
                    <div class="font-semibold text-sm mb-1 truncate">${plan.planName}</div>
                    <div class="text-xs opacity-75">${monthsText} • ${formattedAmount}</div>
                    ${isActive ? '<div class="text-xs mt-1 font-medium">Active</div>' : ''}
                </button>
                <button
                    type="button"
                    data-delete-plan-id="${plan.id}"
                    class="delete-plan-btn absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-pure-white/80 hover:bg-pure-white text-deep-black dark:bg-charcoal-gray/80 dark:hover:bg-charcoal-gray dark:text-pure-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-60 focus:opacity-50 focus:outline-none focus:ring-2 focus:ring-lime-vibrant focus:ring-offset-2 dark:focus:ring-offset-graphite shadow-sm"
                    aria-label="Delete plan ${plan.planName}"
                    title="Delete plan">
                    <span class="text-base font-bold leading-none">×</span>
                </button>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    private attachEventListeners(): void {
        if (!this.container) {
            return;
        }

        // Plan click handlers
        const planButtons =
            this.container.querySelectorAll<HTMLButtonElement>('button[data-plan-id]');
        planButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                // Prevent activation if delete button was clicked
                const target = event.target;
                if (target instanceof HTMLElement && target.closest('.delete-plan-btn')) {
                    return;
                }

                const planId = button.dataset.planId;
                if (planId && this.onPlanClick) {
                    this.onPlanClick(planId);
                }
            });
        });

        // Delete button handlers
        const deleteButtons = this.container.querySelectorAll<HTMLButtonElement>(
            'button[data-delete-plan-id]'
        );
        deleteButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent plan activation
                const planId = button.dataset.deletePlanId;
                if (planId && this.onPlanDelete) {
                    this.onPlanDelete(planId);
                }
            });
        });
    }
}

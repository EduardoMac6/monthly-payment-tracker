import type { Plan, OverviewStats, TotalsSnapshot } from '../../types/index.js';
import { PlansService } from '../../services/plans/plans.service.js';
import { PaymentsService } from '../../services/payments/payments.service.js';
import { StorageFactory } from '../../services/storage/storage.factory.js';
import { PaymentTableComponent } from '../../components/payment-table/payment-table.component.js';
import { PlanListComponent } from '../../components/plan-list/plan-list.component.js';
import { ToastService } from '../../components/toast/toast.component.js';
import { formatCurrency, formatMonthsText, formatOwnerText } from '../../utils/formatters.js';
import { ErrorHandler } from '../../utils/errors.js';
import { escapeHtml } from '../../utils/sanitizer.js';

/**
 * Dashboard Page
 * Main page controller for the dashboard
 */
export class DashboardPage {
    private allPlans: Plan[] = [];
    private activePlan: Plan | null = null;

    // DOM Elements
    private overviewView: HTMLElement | null;
    private planDetailView: HTMLElement | null;
    private totalPaidEl: HTMLElement | null;
    private remainingBalanceEl: HTMLElement | null;
    private totalCostEl: HTMLElement | null;
    private planNameHeader: HTMLElement | null;
    private planDescription: HTMLElement | null;
    private backToOverviewBtn: HTMLElement | null;
    private clearBtn: HTMLElement | null;

    // Components
    private paymentTable: PaymentTableComponent;
    private planList: PlanListComponent;

    constructor() {
        // Get DOM elements
        this.overviewView = document.getElementById('overview-view');
        this.planDetailView = document.getElementById('plan-detail-view');
        this.totalPaidEl = document.getElementById('total-paid');
        this.remainingBalanceEl = document.getElementById('remaining-balance');
        this.totalCostEl = document.getElementById('total-cost');
        this.planNameHeader = document.getElementById('plan-name-header');
        this.planDescription = document.getElementById('plan-description');
        this.backToOverviewBtn = document.getElementById('back-to-overview');
        this.clearBtn = document.getElementById('clear-btn');

        // Initialize components
        this.paymentTable = new PaymentTableComponent('payment-table-body');
        this.planList = new PlanListComponent('plans-list');

        // Set up component callbacks
        this.setupComponentCallbacks();
    }

    /**
     * Initialize the dashboard page
     */
    async init(): Promise<void> {
        try {
            // Check if plans exist
            this.allPlans = await PlansService.getAllPlans();
            if (this.allPlans.length === 0) {
                if (confirm('No payment plan found. Would you like to create one?')) {
                    window.location.href = 'start.html';
                }
                return;
            }

            // Get active plan
            this.activePlan = await PlansService.getActivePlan();

            // Set up event listeners
            this.setupEventListeners();

            // Show overview by default
            await this.showOverview();

            // Render plan list in sidebar
            this.planList.setActivePlan(this.activePlan);
            await this.planList.render(this.allPlans);
        } catch (error) {
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.init'
            );
        }
    }

    /**
     * Set up component callbacks
     */
    private setupComponentCallbacks(): void {
        // Payment table callbacks
        this.paymentTable.setOnToggleChange(async (monthIndex, isChecked) => {
            await this.handlePaymentToggleChange(monthIndex, isChecked);
        });

        // Plan list callbacks
        this.planList.setOnPlanClick(async (planId) => {
            await this.switchToPlan(planId);
        });

        this.planList.setOnPlanDelete(async (planId) => {
            await this.deletePlan(planId);
        });
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners(): void {
        // Back to overview button
        if (this.backToOverviewBtn) {
            this.backToOverviewBtn.addEventListener('click', async () => {
                await this.showOverview();
            });
        }

        // Clear records button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', async () => {
                await this.clearPaymentRecords();
            });
        }

        // Overview plan cards click handlers
        const overviewPlansList = document.getElementById('overview-plans-list');
        if (overviewPlansList) {
            overviewPlansList.addEventListener('click', async (event) => {
                const target = event.target as HTMLElement;
                const planCard = target.closest('[data-view-plan-id]');
                if (planCard) {
                    const planId = planCard.getAttribute('data-view-plan-id');
                    if (planId) {
                        await this.showPlanDetail(planId);
                    }
                }
            });
        }
    }

    /**
     * Calculate overview statistics
     */
    private async calculateOverviewStats(): Promise<OverviewStats> {
        let totalDebt = 0;
        let totalPaid = 0;
        let myDebtsTotal = 0;
        let myDebtsPaid = 0;
        let receivablesTotal = 0;
        let receivablesReceived = 0;

        for (const plan of this.allPlans) {
            const status = await PaymentsService.getPlanPaymentStatus(plan.id, this.allPlans);
            totalDebt += plan.totalAmount;
            totalPaid += status.totalPaid;

            if (plan.debtOwner === 'self' || !plan.debtOwner) {
                myDebtsTotal += plan.totalAmount;
                myDebtsPaid += status.totalPaid;
            } else if (plan.debtOwner === 'other') {
                receivablesTotal += plan.totalAmount;
                receivablesReceived += status.totalPaid;
            }
        }

        return {
            totalPlans: this.allPlans.length,
            totalDebt,
            totalPaid,
            remaining: totalDebt - totalPaid,
            myDebts: {
                total: myDebtsTotal,
                paid: myDebtsPaid,
                remaining: myDebtsTotal - myDebtsPaid,
            },
            receivables: {
                total: receivablesTotal,
                received: receivablesReceived,
                pending: receivablesTotal - receivablesReceived,
            },
        };
    }

    /**
     * Render overview view
     */
    private async renderOverview(): Promise<void> {
        const stats = await this.calculateOverviewStats();

        // Update header description
        const overviewPlansNumber = document.getElementById('overview-plans-number');
        const overviewPlansPlural = document.getElementById('overview-plans-plural');
        if (overviewPlansNumber) {
            overviewPlansNumber.textContent = stats.totalPlans.toString();
        }
        if (overviewPlansPlural) {
            overviewPlansPlural.textContent = stats.totalPlans === 1 ? '' : 's';
        }

        // Update general statistics
        const overviewTotalDebt = document.getElementById('overview-total-debt');
        const overviewTotalPaid = document.getElementById('overview-total-paid');
        const overviewRemaining = document.getElementById('overview-remaining');

        if (overviewTotalDebt) overviewTotalDebt.textContent = formatCurrency(stats.totalDebt);
        if (overviewTotalPaid) overviewTotalPaid.textContent = formatCurrency(stats.totalPaid);
        if (overviewRemaining) overviewRemaining.textContent = formatCurrency(stats.remaining);

        // Update "My Debts" section
        const myDebtsTotal = document.getElementById('my-debts-total');
        const myDebtsPaid = document.getElementById('my-debts-paid');
        const myDebtsRemaining = document.getElementById('my-debts-remaining');

        if (myDebtsTotal) myDebtsTotal.textContent = formatCurrency(stats.myDebts.total);
        if (myDebtsPaid) myDebtsPaid.textContent = formatCurrency(stats.myDebts.paid);
        if (myDebtsRemaining)
            myDebtsRemaining.textContent = formatCurrency(stats.myDebts.remaining);

        // Update "Receivables" section
        const receivablesTotal = document.getElementById('receivables-total');
        const receivablesReceived = document.getElementById('receivables-received');
        const receivablesPending = document.getElementById('receivables-pending');

        if (receivablesTotal)
            receivablesTotal.textContent = formatCurrency(stats.receivables.total);
        if (receivablesReceived)
            receivablesReceived.textContent = formatCurrency(stats.receivables.received);
        if (receivablesPending)
            receivablesPending.textContent = formatCurrency(stats.receivables.pending);

        // Render plans list in overview
        await this.renderOverviewPlansList();
    }

    /**
     * Render plans list in overview
     */
    private async renderOverviewPlansList(): Promise<void> {
        const overviewPlansList = document.getElementById('overview-plans-list');
        if (!overviewPlansList) {
            return;
        }

        const plansHTMLPromises = this.allPlans.map(async (plan) => {
            const planStatus = await PaymentsService.getPlanPaymentStatus(plan.id, this.allPlans);
            const paidMonths = await PaymentsService.getPaidMonthsCount(plan.id);
            const monthsText = formatMonthsText(plan, paidMonths);
            const ownerText = formatOwnerText(plan);
            const progressPercent =
                plan.totalAmount > 0 ? (planStatus.totalPaid / plan.totalAmount) * 100 : 0;

            return `
                <div class="bg-soft-gray/40 dark:bg-charcoal-gray/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer" data-view-plan-id="${plan.id}">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="font-semibold text-deep-black dark:text-pure-white">${escapeHtml(plan.planName)}</h4>
                            <p class="text-xs text-gray-600 dark:text-pure-white/70 mt-1">${monthsText} • ${ownerText}</p>
                        </div>
                        <span class="text-lg font-bold text-deep-black dark:text-pure-white">${formatCurrency(plan.totalAmount)}</span>
                    </div>
                    <div class="mt-3">
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-gray-600 dark:text-pure-white/70">Paid: ${formatCurrency(planStatus.totalPaid)}</span>
                            <span class="text-gray-600 dark:text-pure-white/70">${Math.round(progressPercent)}%</span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-charcoal-gray rounded-full h-2">
                            <div class="bg-lime-vibrant h-2 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        const plansHTML = (await Promise.all(plansHTMLPromises)).join('');
        overviewPlansList.innerHTML = plansHTML;
    }

    /**
     * Show overview view
     */
    async showOverview(): Promise<void> {
        if (this.overviewView) this.overviewView.classList.remove('hidden');
        if (this.planDetailView) this.planDetailView.classList.add('hidden');
        await this.renderOverview();
    }

    /**
     * Show plan detail view
     */
    async showPlanDetail(planId: string): Promise<void> {
        const plan = await PlansService.getPlanById(planId);
        if (!plan) {
            return;
        }

        this.activePlan = plan;
        this.paymentTable.setPlan(plan);
        this.paymentTable.render();

        // Update header
        if (this.planNameHeader) {
            this.planNameHeader.textContent = plan.planName;
        }
        if (this.planDescription) {
            const monthsText =
                plan.numberOfMonths === 'one-time'
                    ? 'One-time payment'
                    : `${plan.numberOfMonths}-month payment plan`;
            this.planDescription.textContent = `Track your ${monthsText.toLowerCase()}.`;
        }

        // Load payment status
        const storage = StorageFactory.create();
        const statusArray = await storage.getPaymentStatus(plan.id);
        this.paymentTable.loadPaymentStatus(statusArray);

        // Update totals
        const totals = this.updateTotals();
        await this.savePaymentStatus(totals);

        // Switch views
        if (this.overviewView) this.overviewView.classList.add('hidden');
        if (this.planDetailView) this.planDetailView.classList.remove('hidden');

        // Update logo
        this.updatePlanDetailLogo();

        // Update plan list active state
        this.planList.setActivePlan(plan);
        await this.planList.render(this.allPlans);
    }

    /**
     * Update totals display
     */
    private updateTotals(): TotalsSnapshot {
        if (
            !this.activePlan ||
            !this.totalPaidEl ||
            !this.remainingBalanceEl ||
            !this.totalCostEl
        ) {
            return { totalPaid: 0, remaining: 0 };
        }

        const paymentToggles = this.paymentTable.getPaymentToggles();
        const totals = PaymentsService.calculateTotalsFromToggles(
            this.activePlan.totalAmount,
            paymentToggles
        );

        // Update all toggles visual state
        paymentToggles.forEach((toggle) => {
            this.paymentTable.updateToggleVisual(toggle);
        });

        // Update DOM
        this.totalPaidEl.textContent = formatCurrency(totals.totalPaid);
        this.remainingBalanceEl.textContent = formatCurrency(totals.remaining);
        this.totalCostEl.textContent = formatCurrency(this.activePlan.totalAmount);

        return totals;
    }

    /**
     * Save payment status
     */
    private async savePaymentStatus(totals?: TotalsSnapshot): Promise<void> {
        if (!this.activePlan) {
            return;
        }

        const paymentToggles = this.paymentTable.getPaymentToggles();
        const statusArray: string[] = [];
        paymentToggles.forEach((toggle) => {
            statusArray.push(toggle.checked ? 'paid' : 'pending');
        });

        await PaymentsService.savePaymentStatus(
            this.activePlan.id,
            statusArray as any,
            totals,
            this.allPlans
        );

        // Update overview if visible
        if (this.overviewView && !this.overviewView.classList.contains('hidden')) {
            await this.renderOverview();
        }
    }

    /**
     * Handle payment toggle change
     */
    private async handlePaymentToggleChange(monthIndex: number, isChecked: boolean): Promise<void> {
        if (!this.activePlan) {
            return;
        }

        const allToggles = this.paymentTable.getPaymentToggles();

        if (isChecked) {
            // If checking a month, check all previous months
            allToggles.forEach((toggle) => {
                const toggleIndex = parseInt(toggle.dataset.monthIndex || '0', 10);
                if (toggleIndex <= monthIndex && !toggle.checked) {
                    toggle.checked = true;
                    this.paymentTable.updateToggleVisual(toggle);
                }
            });
        } else {
            // If unchecking a month, uncheck all following months
            allToggles.forEach((toggle) => {
                const toggleIndex = parseInt(toggle.dataset.monthIndex || '0', 10);
                if (toggleIndex >= monthIndex && toggle.checked) {
                    toggle.checked = false;
                    this.paymentTable.updateToggleVisual(toggle);
                }
            });
        }

        const updatedTotals = this.updateTotals();
        await this.savePaymentStatus(updatedTotals);
        ToastService.success('Estado de pago actualizado');
    }

    /**
     * Switch to a different plan
     */
    private async switchToPlan(planId: string): Promise<void> {
        try {
            await PlansService.switchToPlan(planId);
            ToastService.success('Plan cambiado exitosamente');
            this.allPlans = await PlansService.getAllPlans();
            await this.showPlanDetail(planId);
        } catch (error) {
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.switchToPlan'
            );
        }
    }

    /**
     * Delete a plan
     */
    private async deletePlan(planId: string): Promise<void> {
        const planToDelete = await PlansService.getPlanById(planId);
        if (!planToDelete) {
            return;
        }

        const confirmMessage = `¿Estás seguro de que quieres eliminar el plan "${planToDelete.planName}"?\n\nEsta acción no se puede deshacer y se perderán todos los registros de pago asociados.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const isDeletingActivePlan = this.activePlan !== null && planId === this.activePlan.id;
            await PlansService.deletePlan(planId);

            ToastService.success('Plan eliminado exitosamente');
            this.allPlans = await PlansService.getAllPlans();

            if (isDeletingActivePlan && this.allPlans.length === 0) {
                setTimeout(() => {
                    window.location.href = 'start.html';
                }, 1500);
            } else {
                // Reload to update view
                setTimeout(() => {
                    location.reload();
                }, 500);
            }
        } catch (error) {
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.deletePlan'
            );
        }
    }

    /**
     * Clear payment records for current plan
     */
    private async clearPaymentRecords(): Promise<void> {
        if (!this.activePlan) {
            return;
        }

        if (confirm('Are you sure you want to clear the payment records for this plan?')) {
            try {
                await PaymentsService.clearPaymentRecords(this.activePlan.id);
                ToastService.success('Registros de pago eliminados');
                await this.showPlanDetail(this.activePlan.id);
                if (this.overviewView && !this.overviewView.classList.contains('hidden')) {
                    await this.renderOverview();
                }
            } catch (error) {
                ErrorHandler.handle(
                    error instanceof Error ? error : new Error('Unknown error'),
                    'DashboardPage.clearPaymentRecords'
                );
            }
        }
    }

    /**
     * Update plan detail logo
     */
    private updatePlanDetailLogo(): void {
        const planDetailLogo = document.getElementById(
            'plan-detail-logo'
        ) as HTMLImageElement | null;
        if (planDetailLogo) {
            const isDark = document.documentElement.classList.contains('dark');
            const logoSrc = isDark
                ? planDetailLogo.dataset.logoDark
                : planDetailLogo.dataset.logoLight;
            if (logoSrc) {
                planDetailLogo.setAttribute('src', logoSrc);
            }
        }
    }
}

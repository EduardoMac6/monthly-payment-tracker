import type { Plan, OverviewStats, TotalsSnapshot, PaymentStatus } from '../../types/index.js';
import { PlansService } from '../../services/plans/plans.service.js';
import { PaymentsService } from '../../services/payments/payments.service.js';
import { StorageFactory } from '../../services/storage/storage.factory.js';
import { PaymentTableComponent } from '../../components/payment-table/payment-table.component.js';
import { PlanListComponent } from '../../components/plan-list/plan-list.component.js';
import { ToastService } from '../../components/toast/toast.component.js';
import { LoadingComponent } from '../../components/loading/loading.component.js';
import { ErrorStateComponent } from '../../components/error-state/error-state.component.js';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component.js';
import { ConnectionStatusComponent } from '../../components/connection-status/connection-status.component.js';
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
    private filteredPlans: Plan[] = [];

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
    private planSearch: HTMLInputElement | null;
    private planFilter: HTMLSelectElement | null;
    private overviewSearch: HTMLInputElement | null;
    private overviewFilter: HTMLSelectElement | null;

    // Components
    private paymentTable: PaymentTableComponent;
    private planList: PlanListComponent;
    private connectionStatus: ConnectionStatusComponent;

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
        this.planSearch = document.getElementById('plan-search') as HTMLInputElement | null;
        this.planFilter = document.getElementById('plan-filter') as HTMLSelectElement | null;
        this.overviewSearch = document.getElementById('overview-search') as HTMLInputElement | null;
        this.overviewFilter = document.getElementById(
            'overview-filter'
        ) as HTMLSelectElement | null;

        // Initialize components
        this.paymentTable = new PaymentTableComponent('payment-table-body');
        this.planList = new PlanListComponent('plans-list');
        this.connectionStatus = new ConnectionStatusComponent();

        // Set up component callbacks
        this.setupComponentCallbacks();
    }

    /**
     * Initialize the dashboard page
     */
    async init(): Promise<void> {
        const loaderId = LoadingComponent.show(null, { message: 'Loading dashboard...' });
        try {
            // Check if plans exist
            this.allPlans = await PlansService.getAllPlans();
            LoadingComponent.hide(loaderId);

            if (this.allPlans.length === 0) {
                this.showEmptyState();
                return;
            }

            // Get active plan
            this.activePlan = await PlansService.getActivePlan();

            // Set up event listeners
            this.setupEventListeners();

            // Show overview by default
            await this.showOverview();

            // Initialize filtered plans
            this.filteredPlans = [...this.allPlans];

            // Render plan list in sidebar
            this.planList.setActivePlan(this.activePlan);
            await this.planList.render(this.filteredPlans);

            // Initialize connection status component
            this.connectionStatus.init();
        } catch (error) {
            LoadingComponent.hide(loaderId);
            this.showErrorState(
                error instanceof Error ? error : new Error('Failed to load dashboard')
            );
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

        // Search and filter listeners
        if (this.planSearch) {
            this.planSearch.addEventListener('input', () => {
                this.applyFilters();
            });
        }

        if (this.planFilter) {
            this.planFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (this.overviewSearch) {
            this.overviewSearch.addEventListener('input', () => {
                this.applyOverviewFilters();
            });
        }

        if (this.overviewFilter) {
            this.overviewFilter.addEventListener('change', () => {
                this.applyOverviewFilters();
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
        const loaderId = LoadingComponent.show(this.overviewView, {
            message: 'Loading overview...',
            size: 'small',
        });
        try {
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
            LoadingComponent.hide(loaderId);
        } catch (error) {
            LoadingComponent.hide(loaderId);
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.renderOverview'
            );
        }
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
        const loaderId = LoadingComponent.show(this.planDetailView, { message: 'Loading plan...' });
        try {
            const plan = await PlansService.getPlanById(planId);
            if (!plan) {
                LoadingComponent.hide(loaderId);
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
            LoadingComponent.hide(loaderId);
        } catch (error) {
            LoadingComponent.hide(loaderId);
            ToastService.error('Failed to load plan details');
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.showPlanDetail'
            );
        }
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
            statusArray as PaymentStatus[],
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

        const loaderId = LoadingComponent.show(this.planDetailView, {
            message: 'Saving payment status...',
            size: 'small',
        });
        try {
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
            LoadingComponent.hide(loaderId);
            ToastService.success('Estado de pago actualizado');
        } catch (error) {
            LoadingComponent.hide(loaderId);
            ToastService.error('Failed to save payment status');
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'DashboardPage.handlePaymentToggleChange'
            );
        }
    }

    /**
     * Switch to a different plan
     */
    private async switchToPlan(planId: string): Promise<void> {
        const loaderId = LoadingComponent.show(null, { message: 'Switching plan...' });
        try {
            await PlansService.switchToPlan(planId);
            this.allPlans = await PlansService.getAllPlans();
            LoadingComponent.hide(loaderId);
            ToastService.success('Plan cambiado exitosamente');
            await this.showPlanDetail(planId);
        } catch (error) {
            LoadingComponent.hide(loaderId);
            ToastService.error('Failed to switch plan');
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

        const loaderId = LoadingComponent.show(null, { message: 'Deleting plan...' });
        try {
            const isDeletingActivePlan = this.activePlan !== null && planId === this.activePlan.id;
            await PlansService.deletePlan(planId);

            this.allPlans = await PlansService.getAllPlans();
            LoadingComponent.hide(loaderId);
            ToastService.success('Plan eliminado exitosamente');

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
            LoadingComponent.hide(loaderId);
            ToastService.error('Failed to delete plan');
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
            const loaderId = LoadingComponent.show(this.planDetailView, {
                message: 'Clearing payment records...',
            });
            try {
                await PaymentsService.clearPaymentRecords(this.activePlan.id);
                LoadingComponent.hide(loaderId);
                ToastService.success('Registros de pago eliminados');
                await this.showPlanDetail(this.activePlan.id);
                if (this.overviewView && !this.overviewView.classList.contains('hidden')) {
                    await this.renderOverview();
                }
            } catch (error) {
                LoadingComponent.hide(loaderId);
                ToastService.error('Failed to clear payment records');
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

    /**
     * Show empty state when no plans exist
     */
    private showEmptyState(): void {
        const container = this.overviewView || document.body;
        EmptyStateComponent.render(container, {
            title: 'No Payment Plans Yet',
            message: 'Create your first payment plan to start tracking your payments.',
            actionLabel: 'Create Plan',
            onAction: () => {
                window.location.href = 'start.html';
            },
        });
    }

    /**
     * Show error state
     */
    private showErrorState(error: Error): void {
        const container = this.overviewView || document.body;
        ErrorStateComponent.render(container, {
            title: 'Error Loading Dashboard',
            message:
                error.message || 'An unexpected error occurred. Please try refreshing the page.',
            actionLabel: 'Retry',
            onAction: () => {
                location.reload();
            },
        });
    }

    /**
     * Apply filters to plan list in sidebar
     */
    private applyFilters(): void {
        const searchTerm = this.planSearch?.value.toLowerCase() || '';
        const filterValue = this.planFilter?.value || 'all';

        this.filteredPlans = this.allPlans.filter((plan) => {
            // Search filter
            const matchesSearch = plan.planName.toLowerCase().includes(searchTerm);

            // Category filter
            let matchesFilter = true;
            if (filterValue === 'self') {
                matchesFilter = plan.debtOwner === 'self' || !plan.debtOwner;
            } else if (filterValue === 'other') {
                matchesFilter = plan.debtOwner === 'other';
            }

            return matchesSearch && matchesFilter;
        });

        this.planList.render(this.filteredPlans);
    }

    /**
     * Apply filters to overview plans list
     */
    private applyOverviewFilters(): void {
        const searchTerm = this.overviewSearch?.value.toLowerCase() || '';
        const filterValue = this.overviewFilter?.value || 'all';

        // Filter plans for overview display
        const filtered = this.allPlans.filter((plan) => {
            const matchesSearch = plan.planName.toLowerCase().includes(searchTerm);
            let matchesFilter = true;
            if (filterValue === 'self') {
                matchesFilter = plan.debtOwner === 'self' || !plan.debtOwner;
            } else if (filterValue === 'other') {
                matchesFilter = plan.debtOwner === 'other';
            }
            return matchesSearch && matchesFilter;
        });

        // Re-render overview with filtered plans
        this.renderOverviewPlansList(filtered);
    }

    /**
     * Render overview plans list (with optional filtered plans)
     */
    private async renderOverviewPlansList(plans?: Plan[]): Promise<void> {
        const plansToRender = plans || this.allPlans;
        const overviewPlansList = document.getElementById('overview-plans-list');
        if (!overviewPlansList) {
            return;
        }

        const plansHTMLPromises = plansToRender.map(async (plan) => {
            const planStatus = await PaymentsService.getPlanPaymentStatus(plan.id, this.allPlans);
            const paidMonths = await PaymentsService.getPaidMonthsCount(plan.id);
            const monthsText = formatMonthsText(plan, paidMonths);
            const ownerText = formatOwnerText(plan.debtOwner);

            return `
                <div
                    data-view-plan-id="${escapeHtml(plan.id)}"
                    class="plan-card cursor-pointer rounded-2xl border-2 border-soft-gray/60 bg-pure-white p-6 shadow-lg transition-all duration-300 hover:border-lime-vibrant hover:shadow-xl dark:border-charcoal-gray/60 dark:bg-charcoal-gray/50 dark:hover:border-lime-vibrant"
                >
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-deep-black dark:text-pure-white mb-1">${escapeHtml(plan.planName)}</h3>
                            <p class="text-sm text-gray-600 dark:text-pure-white/70">${ownerText}</p>
                        </div>
                        <span class="text-2xl font-bold text-lime-vibrant">${formatCurrency(planStatus.totalPaid)}</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600 dark:text-pure-white/70">Total:</span>
                            <span class="font-semibold text-deep-black dark:text-pure-white">${formatCurrency(plan.totalAmount)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600 dark:text-pure-white/70">Progress:</span>
                            <span class="font-semibold text-deep-black dark:text-pure-white">${monthsText}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600 dark:text-pure-white/70">Remaining:</span>
                            <span class="font-semibold text-deep-black dark:text-pure-white">${formatCurrency(planStatus.remaining)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        const plansHTML = (await Promise.all(plansHTMLPromises)).join('');
        overviewPlansList.innerHTML = plansHTML;
    }
}

/**
 * Dashboard Page Logic
 * Main entry point for the dashboard page
 */
import { PlansService } from '../services/plans';
import { PaymentTable } from '../components/payment-table';
import { PlanList } from '../components/plan-list';
import { StorageService } from '../services/storage';
export function initializeDashboard() {
    // Get active plan
    const activePlanOrNull = PlansService.getActivePlan();
    if (!activePlanOrNull) {
        if (confirm('No payment plan found. Would you like to create one?')) {
            window.location.href = 'start.html';
        }
        return;
    }
    const activePlan = activePlanOrNull;
    // Get DOM elements
    const tableBody = document.getElementById('payment-table-body');
    const totalPaidEl = document.getElementById('total-paid');
    const remainingBalanceEl = document.getElementById('remaining-balance');
    const totalCostEl = document.getElementById('total-cost');
    const planNameHeader = document.getElementById('plan-name-header');
    const planDescription = document.getElementById('plan-description');
    const plansListContainer = document.getElementById('plans-list');
    const clearBtn = document.getElementById('clear-btn');
    // Validate required elements
    if (!tableBody || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
        console.error('Required DOM elements were not found');
        return;
    }
    // Update header with plan name
    if (planNameHeader) {
        planNameHeader.textContent = activePlan.planName;
    }
    if (planDescription) {
        const numberOfMonths = activePlan.numberOfMonths === 'one-time' ? 1 : activePlan.numberOfMonths;
        const isOneTimePayment = activePlan.numberOfMonths === 'one-time';
        const monthsText = isOneTimePayment
            ? 'One-time payment'
            : `${numberOfMonths}-month payment plan`;
        planDescription.textContent = `Track your ${monthsText.toLowerCase()}.`;
    }
    // Initialize Payment Table
    const paymentTable = new PaymentTable(tableBody, totalPaidEl, remainingBalanceEl, totalCostEl, activePlan);
    // Generate table and load saved status
    paymentTable.generateTable();
    paymentTable.loadPaymentStatus();
    const initialTotals = paymentTable.updateTotals();
    paymentTable.savePaymentStatus(initialTotals);
    // Handle payment toggle changes
    tableBody.addEventListener('change', (event) => {
        paymentTable.handleMonthMarking(event);
    });
    // Initialize Plan List
    if (plansListContainer) {
        const planList = new PlanList(plansListContainer, activePlan.id, {
            onPlanSwitch: (planId) => {
                if (PlansService.switchToPlan(planId)) {
                    location.reload();
                }
            },
            onPlanDelete: (planId) => {
                const planToDelete = PlansService.getAllPlans().find(p => p.id === planId);
                if (!planToDelete)
                    return;
                const confirmMessage = `¿Estás seguro de que quieres eliminar el plan "${planToDelete.planName}"?\n\nEsta acción no se puede deshacer y se perderán todos los registros de pago asociados.`;
                if (!confirm(confirmMessage)) {
                    return;
                }
                const isDeletingActivePlan = planId === activePlan.id;
                PlansService.deletePlan(planId);
                if (isDeletingActivePlan) {
                    const remainingPlans = PlansService.getAllPlans();
                    if (remainingPlans.length === 0) {
                        alert('Plan eliminado. Serás redirigido para crear un nuevo plan.');
                        window.location.href = 'start.html';
                    }
                    else {
                        location.reload();
                    }
                }
                else {
                    planList.render();
                }
            }
        });
        planList.render();
    }
    // Clear Records button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the payment records for this plan?')) {
                StorageService.removePaymentStatus(activePlan.id);
                location.reload();
            }
        });
    }
    // Initialize theme toggle
    initializeThemeToggle();
}
/**
 * Initialize theme toggle functionality
 */
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-toggle-label');
    const dashboardLogo = document.getElementById('dashboard-logo');
    const rootElement = document.documentElement;
    function updateThemeToggleUI(theme) {
        themeToggle?.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle?.setAttribute('data-theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }
    function updateLogo(theme) {
        if (!dashboardLogo)
            return;
        const lightSrc = dashboardLogo.dataset.logoLight;
        const darkSrc = dashboardLogo.dataset.logoDark;
        const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
        if (nextSrc) {
            dashboardLogo.setAttribute('src', nextSrc);
        }
    }
    function applyTheme(theme) {
        rootElement.classList.toggle('dark', theme === 'dark');
        StorageService.setTheme(theme);
        updateThemeToggleUI(theme);
        updateLogo(theme);
    }
    const storedTheme = StorageService.getTheme();
    applyTheme(storedTheme);
    themeToggle?.addEventListener('click', () => {
        const isDark = rootElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });
}

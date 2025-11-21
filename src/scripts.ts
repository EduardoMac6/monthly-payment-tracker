document.addEventListener('DOMContentLoaded', function (): void {
    // --- Type Definitions ---
    type Plan = {
        id: string;
        planName: string;
        totalAmount: number;
        numberOfMonths: number | 'one-time';
        monthlyPayment: number;
        debtOwner?: 'self' | 'other'; // Opcional para compatibilidad con planes antiguos
        createdAt: string;
        isActive: boolean;
    };

    // --- Get Active Plan from localStorage ---
    function getActivePlan(): Plan | null {
        const plansJson: string | null = localStorage.getItem('debtLitePlans');
        if (!plansJson) {
            return null;
        }

        const plans: Plan[] = JSON.parse(plansJson);
        const activePlanId: string | null = localStorage.getItem('debtLiteActivePlanId');
        
        if (activePlanId) {
            const plan: Plan | undefined = plans.find(p => p.id === activePlanId);
            if (plan) {
                return plan;
            }
        }

        // Fallback: buscar el primer plan activo
        const activePlan: Plan | undefined = plans.find(p => p.isActive);
        return activePlan || (plans.length > 0 ? plans[plans.length - 1] : null);
    }

    // --- Get All Plans ---
    function getAllPlans(): Plan[] {
        const plansJson: string | null = localStorage.getItem('debtLitePlans');
        return plansJson ? JSON.parse(plansJson) : [];
    }

    // --- Check if plans exist, redirect if not ---
    const allPlans: Plan[] = getAllPlans();
    if (allPlans.length === 0) {
        // No hay planes, redirigir a start.html
        if (confirm('No payment plan found. Would you like to create one?')) {
            window.location.href = 'start.html';
        }
        return;
    }

    // Obtener plan activo (puede ser null si no hay uno activo)
    const activePlanOrNull: Plan | null = getActivePlan();
    let activePlan: Plan | null = activePlanOrNull;

    // --- DOM Elements ---
    const overviewView: HTMLElement | null = document.getElementById('overview-view');
    const planDetailView: HTMLElement | null = document.getElementById('plan-detail-view');
    const tableBody: HTMLElement | null = document.getElementById('payment-table-body');
    const totalPaidEl: HTMLElement | null = document.getElementById('total-paid');
    const remainingBalanceEl: HTMLElement | null = document.getElementById('remaining-balance');
    const totalCostEl: HTMLElement | null = document.getElementById('total-cost');
    const planNameHeader: HTMLElement | null = document.getElementById('plan-name-header');
    const planDescription: HTMLElement | null = document.getElementById('plan-description');
    const backToOverviewBtn: HTMLElement | null = document.getElementById('back-to-overview');

    // Variables para el plan activo (se inicializan cuando se muestra un plan específico)
    let totalCost: number = 0;
    let monthlyPayment: number = 0;
    let numberOfMonths: number = 0;
    let isOneTimePayment: boolean = false;

    // --- Currency Formatter ---
    const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    // --- Calculate Payment Status for a Plan ---
    function getPlanPaymentStatus(planId: string): { totalPaid: number; remaining: number } {
        const savedStatus: string | null = localStorage.getItem(`paymentStatus_${planId}`);
        const savedTotals: string | null = localStorage.getItem(`paymentTotals_${planId}`);
        
        if (savedTotals) {
            try {
                return JSON.parse(savedTotals);
            } catch {
                // Si hay error, calcular desde el status
            }
        }
        
        if (savedStatus) {
            try {
                const statusArray: string[] = JSON.parse(savedStatus);
                const plan: Plan | undefined = allPlans.find(p => p.id === planId);
                if (!plan) {
                    return { totalPaid: 0, remaining: 0 };
                }
                
                const planTotalCost: number = plan.totalAmount;
                const planMonths: number = plan.numberOfMonths === 'one-time' ? 1 : plan.numberOfMonths;
                const planMonthlyPayment: number = plan.monthlyPayment;
                
                let paid: number = 0;
                statusArray.forEach((status: string, idx: number): void => {
                    if (status === 'paid' || status === 'pagado') {
                        if (plan.numberOfMonths === 'one-time') {
                            paid += planTotalCost;
                        } else {
                            const payment: number = (idx === planMonths - 1) 
                                ? (planTotalCost - (planMonthlyPayment * (planMonths - 1))) 
                                : planMonthlyPayment;
                            paid += payment;
                        }
                    }
                });
                
                return {
                    totalPaid: paid,
                    remaining: planTotalCost - paid
                };
            } catch {
                return { totalPaid: 0, remaining: 0 };
            }
        }
        
        return { totalPaid: 0, remaining: 0 };
    }

    // --- Calculate Overview Statistics ---
    function calculateOverviewStats(): {
        totalPlans: number;
        totalDebt: number;
        totalPaid: number;
        remaining: number;
        myDebts: { total: number; paid: number; remaining: number };
        receivables: { total: number; received: number; pending: number };
    } {
        let totalDebt: number = 0;
        let totalPaid: number = 0;
        let myDebtsTotal: number = 0;
        let myDebtsPaid: number = 0;
        let receivablesTotal: number = 0;
        let receivablesReceived: number = 0;

        allPlans.forEach((plan: Plan): void => {
            const status = getPlanPaymentStatus(plan.id);
            totalDebt += plan.totalAmount;
            totalPaid += status.totalPaid;

            if (plan.debtOwner === 'self' || !plan.debtOwner) {
                myDebtsTotal += plan.totalAmount;
                myDebtsPaid += status.totalPaid;
            } else if (plan.debtOwner === 'other') {
                receivablesTotal += plan.totalAmount;
                receivablesReceived += status.totalPaid;
            }
        });

        return {
            totalPlans: allPlans.length,
            totalDebt,
            totalPaid,
            remaining: totalDebt - totalPaid,
            myDebts: {
                total: myDebtsTotal,
                paid: myDebtsPaid,
                remaining: myDebtsTotal - myDebtsPaid
            },
            receivables: {
                total: receivablesTotal,
                received: receivablesReceived,
                pending: receivablesTotal - receivablesReceived
            }
        };
    }

    // --- Render Overview View ---
    function renderOverview(): void {
        const stats = calculateOverviewStats();
        
        // Actualizar estadísticas generales
        const overviewTotalPlans: HTMLElement | null = document.getElementById('overview-total-plans');
        const overviewTotalDebt: HTMLElement | null = document.getElementById('overview-total-debt');
        const overviewTotalPaid: HTMLElement | null = document.getElementById('overview-total-paid');
        const overviewRemaining: HTMLElement | null = document.getElementById('overview-remaining');
        
        if (overviewTotalPlans) overviewTotalPlans.textContent = stats.totalPlans.toString();
        if (overviewTotalDebt) overviewTotalDebt.textContent = currencyFormatter.format(stats.totalDebt);
        if (overviewTotalPaid) overviewTotalPaid.textContent = currencyFormatter.format(stats.totalPaid);
        if (overviewRemaining) overviewRemaining.textContent = currencyFormatter.format(stats.remaining);

        // Actualizar sección "My Debts"
        const myDebtsTotal: HTMLElement | null = document.getElementById('my-debts-total');
        const myDebtsPaid: HTMLElement | null = document.getElementById('my-debts-paid');
        const myDebtsRemaining: HTMLElement | null = document.getElementById('my-debts-remaining');
        
        if (myDebtsTotal) myDebtsTotal.textContent = currencyFormatter.format(stats.myDebts.total);
        if (myDebtsPaid) myDebtsPaid.textContent = currencyFormatter.format(stats.myDebts.paid);
        if (myDebtsRemaining) myDebtsRemaining.textContent = currencyFormatter.format(stats.myDebts.remaining);

        // Actualizar sección "Receivables"
        const receivablesTotal: HTMLElement | null = document.getElementById('receivables-total');
        const receivablesReceived: HTMLElement | null = document.getElementById('receivables-received');
        const receivablesPending: HTMLElement | null = document.getElementById('receivables-pending');
        
        if (receivablesTotal) receivablesTotal.textContent = currencyFormatter.format(stats.receivables.total);
        if (receivablesReceived) receivablesReceived.textContent = currencyFormatter.format(stats.receivables.received);
        if (receivablesPending) receivablesPending.textContent = currencyFormatter.format(stats.receivables.pending);

        // Renderizar lista de planes en la vista general
        const overviewPlansList: HTMLElement | null = document.getElementById('overview-plans-list');
        if (overviewPlansList) {
            const plansHTML: string = allPlans.map((plan: Plan): string => {
                const planStatus = getPlanPaymentStatus(plan.id);
                const monthsText: string = plan.numberOfMonths === 'one-time' 
                    ? 'One-time' 
                    : `${plan.numberOfMonths} months`;
                const ownerText: string = plan.debtOwner === 'other' ? 'Receivable' : 'My Debt';
                const progressPercent: number = plan.totalAmount > 0 
                    ? (planStatus.totalPaid / plan.totalAmount) * 100 
                    : 0;

                return `
                    <div class="bg-soft-gray/40 dark:bg-charcoal-gray/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer" data-view-plan-id="${plan.id}">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-semibold text-deep-black dark:text-pure-white">${plan.planName}</h4>
                                <p class="text-xs text-gray-600 dark:text-pure-white/70 mt-1">${monthsText} • ${ownerText}</p>
                            </div>
                            <span class="text-lg font-bold text-deep-black dark:text-pure-white">${currencyFormatter.format(plan.totalAmount)}</span>
                        </div>
                        <div class="mt-3">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-gray-600 dark:text-pure-white/70">Paid: ${currencyFormatter.format(planStatus.totalPaid)}</span>
                                <span class="text-gray-600 dark:text-pure-white/70">${Math.round(progressPercent)}%</span>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-charcoal-gray rounded-full h-2">
                                <div class="bg-lime-vibrant h-2 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            overviewPlansList.innerHTML = plansHTML;

            // Agregar event listeners para ver plan específico
            overviewPlansList.querySelectorAll('[data-view-plan-id]').forEach((element: Element): void => {
                element.addEventListener('click', function(): void {
                    const planId: string | undefined = element.getAttribute('data-view-plan-id') || undefined;
                    if (planId) {
                        showPlanDetail(planId);
                    }
                });
            });
        }
    }

    // --- Show Plan Detail View ---
    function showPlanDetail(planId: string): void {
        const plan: Plan | undefined = allPlans.find(p => p.id === planId);
        if (!plan) {
            return;
        }

        // Actualizar plan activo
        activePlan = plan;
        totalCost = plan.totalAmount;
        monthlyPayment = plan.monthlyPayment;
        numberOfMonths = plan.numberOfMonths === 'one-time' ? 1 : plan.numberOfMonths;
        isOneTimePayment = plan.numberOfMonths === 'one-time';

        // Actualizar header
        if (planNameHeader) {
            planNameHeader.textContent = plan.planName;
        }
        if (planDescription) {
            const monthsText: string = isOneTimePayment 
                ? 'One-time payment' 
                : `${numberOfMonths}-month payment plan`;
            planDescription.textContent = `Track your ${monthsText.toLowerCase()}.`;
        }

        // Generar tabla y cargar estado
        generateTable();
        loadPaymentStatus();
        const initialTotals: TotalsSnapshot = updateTotals();
        savePaymentStatus(initialTotals);

        // Cambiar vistas
        if (overviewView) overviewView.classList.add('hidden');
        if (planDetailView) planDetailView.classList.remove('hidden');

        // Actualizar logo en vista de detalle
        const planDetailLogo: HTMLImageElement | null = document.getElementById('plan-detail-logo') as HTMLImageElement | null;
        if (planDetailLogo) {
            const isDark: boolean = document.documentElement.classList.contains('dark');
            const logoSrc: string | undefined = isDark 
                ? planDetailLogo.dataset.logoDark 
                : planDetailLogo.dataset.logoLight;
            if (logoSrc) {
                planDetailLogo.setAttribute('src', logoSrc);
            }
        }
    }

    // --- Show Overview View ---
    function showOverview(): void {
        if (overviewView) overviewView.classList.remove('hidden');
        if (planDetailView) planDetailView.classList.add('hidden');
        renderOverview();
    }

    // --- Generate the Table ---
    function generateTable(): void {
        if (!tableBody || !activePlan) {
            return;
        }
        let tableHTML: string = '';
        
        if (isOneTimePayment) {
            // One-time payment: solo una fila
            tableHTML += `
                <tr class="border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60">
                    <td class="py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white">
                        <span class="font-medium text-deep-black dark:text-pure-white">One-time Payment</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${currencyFormatter.format(totalCost)}</td>
                    <td class="py-4 px-4 md:px-6 text-center rounded-br-3xl">
                        <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center text-deep-black dark:text-pure-white">
                            <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${totalCost}" data-month-index="0" aria-label="Mark payment as paid" role="switch">
                            <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant dark:bg-charcoal-gray peer-focus-visible:ring-offset-pure-white dark:peer-focus-visible:ring-offset-graphite">
                                <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform dark:bg-pure-white"></span>
                            </span>
                            <span class="status-label text-sm font-semibold text-gray-500 dark:text-gray-300 transition-colors duration-300">Pending</span>
                        </label>
                    </td>
                </tr>
            `;
        } else {
            // Monthly payments
            for (let i: number = 1; i <= numberOfMonths; i++) {
                // Adjust the final payment so the total matches exactly
                const payment: number = (i === numberOfMonths) 
                    ? (totalCost - (monthlyPayment * (numberOfMonths - 1))) 
                    : monthlyPayment;
                
                // Special classes for the last row (rounded bottom corners)
                const isLastRow: boolean = i === numberOfMonths;
                const rowClasses: string = isLastRow 
                    ? 'border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60' 
                    : 'border-b border-gray-200 hover:bg-soft-gray/40 transition-colors dark:border-charcoal-gray/50 dark:hover:bg-charcoal-gray/60';
                const firstCellClasses: string = isLastRow 
                    ? 'py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white' 
                    : 'py-4 px-4 md:px-6 text-left whitespace-nowrap text-deep-black dark:text-pure-white';
                const lastCellClasses: string = isLastRow 
                    ? 'py-4 px-4 md:px-6 text-center rounded-br-3xl' 
                    : 'py-4 px-4 md:px-6 text-center';
                
            tableHTML += `
                <tr class="${rowClasses}">
                    <td class="${firstCellClasses}">
                        <span class="font-medium text-deep-black dark:text-pure-white">Month ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${currencyFormatter.format(payment)}</td>
                    <td class="${lastCellClasses}">
                        <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center text-deep-black dark:text-pure-white">
                            <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${payment}" data-month-index="${i - 1}" aria-label="Mark month ${i} as paid" role="switch">
                            <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant dark:bg-charcoal-gray peer-focus-visible:ring-offset-pure-white dark:peer-focus-visible:ring-offset-graphite">
                                <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform dark:bg-pure-white"></span>
                            </span>
                            <span class="status-label text-sm font-semibold text-gray-500 dark:text-gray-300 transition-colors duration-300">Pending</span>
                        </label>
                    </td>
                </tr>
            `;
            }
        }
        tableBody!.innerHTML = tableHTML;
    }

    function updateToggleVisual(toggle: HTMLInputElement): void {
        const label: HTMLLabelElement | null = toggle.closest('label');
        if (!label) {
            return;
        }

        const track: HTMLElement | null = label.querySelector<HTMLElement>('.toggle-track');
        const thumb: HTMLElement | null = label.querySelector<HTMLElement>('.toggle-thumb');
        const statusLabel: HTMLElement | null = label.querySelector<HTMLElement>('.status-label');

        if (toggle.checked) {
            track?.classList.remove('bg-gray-300');
            track?.classList.remove('dark:bg-charcoal-gray');
            track?.classList.add('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            thumb?.classList.add('translate-x-6');
            statusLabel?.classList.remove('text-gray-500', 'dark:text-gray-300');
            statusLabel?.classList.add('text-deep-black', 'dark:text-pure-white');
            statusLabel && (statusLabel.textContent = 'Paid');
            label.setAttribute('data-state', 'paid');
        } else {
            track?.classList.remove('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            track?.classList.add('bg-gray-300', 'dark:bg-charcoal-gray');
            thumb?.classList.remove('translate-x-6');
            statusLabel?.classList.remove('text-deep-black', 'dark:text-pure-white');
            statusLabel?.classList.add('text-gray-500', 'dark:text-gray-300');
            statusLabel && (statusLabel.textContent = 'Pending');
            label.setAttribute('data-state', 'pending');
        }
    }

    // --- Calculate and Update Totals ---
    type TotalsSnapshot = {
        totalPaid: number;
        remaining: number;
    };

    function updateTotals(): TotalsSnapshot {
        if (!activePlan || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
            return { totalPaid: 0, remaining: 0 };
        }

        let currentTotalPaid: number = 0;
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');

        paymentToggles.forEach((toggle: HTMLInputElement): void => {
            if (toggle.checked) {
                const amount: string | undefined = toggle.dataset.amount;
                if (amount) {
                    currentTotalPaid += parseFloat(amount);
                }
            }

            updateToggleVisual(toggle);
        });

        const remaining: number = totalCost - currentTotalPaid;

        // Update DOM elements with formatted values
        totalPaidEl.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl.textContent = currencyFormatter.format(remaining);
        totalCostEl.textContent = currencyFormatter.format(totalCost);

        return {
            totalPaid: currentTotalPaid,
            remaining
        };
    }

    // --- Save Payment Status to localStorage (by plan ID) ---
    function savePaymentStatus(totals?: TotalsSnapshot): void {
        if (!activePlan) {
            return;
        }
        const snapshot: TotalsSnapshot = totals ?? updateTotals();
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        const statusArray: string[] = [];
        paymentToggles.forEach((toggle: HTMLInputElement): void => {
            statusArray.push(toggle.checked ? 'paid' : 'pending');
        });
        // Guardar usando el ID del plan como clave
        if (activePlan) {
            localStorage.setItem(`paymentStatus_${activePlan.id}`, JSON.stringify(statusArray));
            localStorage.setItem(`paymentTotals_${activePlan.id}`, JSON.stringify(snapshot));
        }
        
        // Actualizar vista general si está visible
        if (overviewView && !overviewView.classList.contains('hidden')) {
            renderOverview();
        }
    }

    // --- Load Payment Status from localStorage (by plan ID) ---
    function loadPaymentStatus(): void {
        if (!activePlan) {
            return;
        }
        const savedStatus: string | null = localStorage.getItem(`paymentStatus_${activePlan.id}`);
        const statusArray: string[] = savedStatus ? JSON.parse(savedStatus) : [];
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        paymentToggles.forEach((toggle: HTMLInputElement, idx: number): void => {
            if (statusArray[idx]) {
                const status: string = statusArray[idx];
                toggle.checked = status === 'paid' || status === 'pagado';
            }
            updateToggleVisual(toggle);
        });
    }

    // --- Render Plans List in Sidebar ---
    function renderPlansList(): void {
        const plansList: HTMLElement | null = document.getElementById('plans-list');
        if (!plansList) {
            return;
        }

        const allPlans: Plan[] = getAllPlans();
        
        if (allPlans.length === 0) {
            plansList.innerHTML = '<p class="text-xs text-deep-black/60 dark:text-pure-white/60 italic">No plans saved yet</p>';
            return;
        }

        // Separar planes por propietario
        const myDebts: Plan[] = allPlans.filter((plan: Plan) => plan.debtOwner === 'self' || !plan.debtOwner); // Incluir planes antiguos sin debtOwner como "self"
        const otherDebts: Plan[] = allPlans.filter((plan: Plan) => plan.debtOwner === 'other');

        // Función para ordenar planes: activo primero, luego por fecha (más reciente primero)
        const sortPlans = (plans: Plan[]): Plan[] => {
            return [...plans].sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
        };

        // Función para renderizar un plan
        const renderPlan = (plan: Plan): string => {
            const isActive: boolean = activePlan !== null && plan.id === activePlan.id;
            const monthsText: string = plan.numberOfMonths === 'one-time' 
                ? 'One-time' 
                : `${plan.numberOfMonths} months`;
            const formattedAmount: string = currencyFormatter.format(plan.totalAmount);
            
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
                        class="delete-plan-btn absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-graphite"
                        aria-label="Delete plan ${plan.planName}"
                        title="Delete plan">
                        <span class="text-base font-bold leading-none">×</span>
                    </button>
                </div>
            `;
        };

        let plansHTML: string = '';

        // Sección: My Debts
        if (myDebts.length > 0) {
            const sortedMyDebts: Plan[] = sortPlans(myDebts);
            plansHTML += `
                <div class="mb-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-deep-black/60 dark:text-pure-white/60 mb-2">My Debts</h3>
                    <div class="space-y-2">
                        ${sortedMyDebts.map(renderPlan).join('')}
                    </div>
                </div>
            `;
        }

        // Sección: Receivables
        if (otherDebts.length > 0) {
            const sortedOtherDebts: Plan[] = sortPlans(otherDebts);
            plansHTML += `
                <div class="mb-4">
                    <h3 class="text-xs font-semibold uppercase tracking-wide text-deep-black/60 dark:text-pure-white/60 mb-2">Receivables</h3>
                    <div class="space-y-2">
                        ${sortedOtherDebts.map(renderPlan).join('')}
                    </div>
                </div>
            `;
        }

        plansList.innerHTML = plansHTML;

        // Agregar event listeners a los botones de planes (para cambiar de plan)
        const planButtons: NodeListOf<HTMLButtonElement> = plansList.querySelectorAll<HTMLButtonElement>('button[data-plan-id]');
        planButtons.forEach((button: HTMLButtonElement): void => {
            button.addEventListener('click', function(event: Event): void {
                // Prevenir que se active si se hizo clic en el botón de eliminar
                const target: EventTarget | null = event.target;
                if (target instanceof HTMLElement && target.closest('.delete-plan-btn')) {
                    return;
                }
                
                const planId: string | undefined = button.dataset.planId;
                if (planId) {
                    switchToPlan(planId);
                }
            });
        });

        // Agregar event listeners a los botones de eliminar
        const deleteButtons: NodeListOf<HTMLButtonElement> = plansList.querySelectorAll<HTMLButtonElement>('button[data-delete-plan-id]');
        deleteButtons.forEach((button: HTMLButtonElement): void => {
            button.addEventListener('click', function(event: Event): void {
                event.stopPropagation(); // Prevenir que se active el plan
                const planId: string | undefined = button.dataset.deletePlanId;
                if (planId) {
                    deletePlan(planId);
                }
            });
        });
    }

    // --- Delete a Plan ---
    function deletePlan(planId: string): void {
        const allPlans: Plan[] = getAllPlans();
        const planToDelete: Plan | undefined = allPlans.find(p => p.id === planId);
        
        if (!planToDelete) {
            return;
        }

        // Mostrar confirmación
        const confirmMessage: string = `¿Estás seguro de que quieres eliminar el plan "${planToDelete.planName}"?\n\nEsta acción no se puede deshacer y se perderán todos los registros de pago asociados.`;
        if (!confirm(confirmMessage)) {
            return;
        }

        const isDeletingActivePlan: boolean = activePlan !== null && planId === activePlan.id;
        const remainingPlans: Plan[] = allPlans.filter(p => p.id !== planId);

        // Eliminar datos de pagos asociados al plan
        localStorage.removeItem(`paymentStatus_${planId}`);
        localStorage.removeItem(`paymentTotals_${planId}`);

        // Si se está eliminando el plan activo
        if (isDeletingActivePlan) {
            if (remainingPlans.length > 0) {
                // Activar el primer plan disponible (o el más reciente)
                const nextPlan: Plan = remainingPlans.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                nextPlan.isActive = true;
                localStorage.setItem('debtLiteActivePlanId', nextPlan.id);
            } else {
                // No hay más planes, limpiar el ID activo
                localStorage.removeItem('debtLiteActivePlanId');
            }
        }

        // Guardar planes actualizados
        localStorage.setItem('debtLitePlans', JSON.stringify(remainingPlans));

        // Si se eliminó el plan activo y no hay más planes, redirigir
        if (isDeletingActivePlan && remainingPlans.length === 0) {
            alert('Plan eliminado. Serás redirigido para crear un nuevo plan.');
            window.location.href = 'start.html';
        } else {
            // Recargar para actualizar la vista
            location.reload();
        }
    }

    // --- Switch to a Different Plan ---
    function switchToPlan(planId: string): void {
        const targetPlan: Plan | undefined = allPlans.find(p => p.id === planId);
        
        if (!targetPlan) {
            return;
        }

        // Desactivar todos los planes
        allPlans.forEach((plan: Plan): void => {
            plan.isActive = false;
        });

        // Activar el plan seleccionado
        targetPlan.isActive = true;

        // Guardar cambios
        localStorage.setItem('debtLitePlans', JSON.stringify(allPlans));
        localStorage.setItem('debtLiteActivePlanId', planId);

        // Mostrar vista de detalle del plan
        showPlanDetail(planId);
    }
    // --- Initialization and Event Listeners ---
    // Mostrar vista general por defecto
    showOverview();
    renderPlansList(); // Render plans in sidebar

    // Botón para volver a la vista general
    if (backToOverviewBtn) {
        backToOverviewBtn.addEventListener('click', function(): void {
            showOverview();
        });
    }

    // Update totals when a toggle changes and persist automatically
    tableBody!.addEventListener('change', function(event: Event): void {
        const target: EventTarget | null = event.target;
        if (target instanceof HTMLInputElement && target.classList.contains('payment-toggle')) {
            const monthIndex: number = parseInt(target.dataset.monthIndex || '0', 10);
            const isChecked: boolean = target.checked;
            
            // Obtener todos los checkboxes de pago
            const allToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
            
            if (isChecked) {
                // Si se marca un mes, marcar automáticamente todos los meses anteriores
                allToggles.forEach((toggle: HTMLInputElement): void => {
                    const toggleIndex: number = parseInt(toggle.dataset.monthIndex || '0', 10);
                    if (toggleIndex <= monthIndex && !toggle.checked) {
                        toggle.checked = true;
                        updateToggleVisual(toggle);
                    }
                });
            } else {
                // Si se desmarca un mes, desmarcar automáticamente todos los meses posteriores
                allToggles.forEach((toggle: HTMLInputElement): void => {
                    const toggleIndex: number = parseInt(toggle.dataset.monthIndex || '0', 10);
                    if (toggleIndex >= monthIndex && toggle.checked) {
                        toggle.checked = false;
                        updateToggleVisual(toggle);
                    }
                });
            }
            
            const updatedTotals: TotalsSnapshot = updateTotals();
            savePaymentStatus(updatedTotals);
        }
    });

    // Clear Records button (only clears payment status for current plan)
    const clearBtn: HTMLElement | null = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(): void {
            if (!activePlan) {
                return;
            }
            if (confirm('Are you sure you want to clear the payment records for this plan?')) {
                localStorage.removeItem(`paymentStatus_${activePlan.id}`);
                localStorage.removeItem(`paymentTotals_${activePlan.id}`);
                // Recargar la vista del plan
                showPlanDetail(activePlan.id);
                // Actualizar vista general si está visible
                if (overviewView && !overviewView.classList.contains('hidden')) {
                    renderOverview();
                }
            }
        });
    }

    // --- Light/Dark Theme Toggle ---
    type ThemeChoice = 'light' | 'dark';

    const themeToggle: HTMLButtonElement | null = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const themeLabel: HTMLElement | null = document.getElementById('theme-toggle-label');
    const dashboardLogo: HTMLImageElement | null = document.getElementById('dashboard-logo') as HTMLImageElement | null;
    const rootElement: HTMLElement = document.documentElement;

    // Menu elements are handled by assets/js/menu.js component

    function updateThemeToggleUI(theme: ThemeChoice): void {
        themeToggle?.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle?.setAttribute('data-theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }

    function updateLogo(theme: ThemeChoice): void {
        // Actualizar logo de vista general
        if (dashboardLogo) {
            const lightSrc: string | undefined = dashboardLogo.dataset.logoLight;
            const darkSrc: string | undefined = dashboardLogo.dataset.logoDark;
            const nextSrc: string | undefined = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                dashboardLogo.setAttribute('src', nextSrc);
            }
        }
        
        // Actualizar logo de vista de detalle
        const planDetailLogo: HTMLImageElement | null = document.getElementById('plan-detail-logo') as HTMLImageElement | null;
        if (planDetailLogo) {
            const lightSrc: string | undefined = planDetailLogo.dataset.logoLight;
            const darkSrc: string | undefined = planDetailLogo.dataset.logoDark;
            const nextSrc: string | undefined = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                planDetailLogo.setAttribute('src', nextSrc);
            }
        }
    }

    function applyTheme(theme: ThemeChoice): void {
        rootElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('debtLiteTheme', theme);
        updateThemeToggleUI(theme);
        updateLogo(theme);
    }

    const storedThemePreference: ThemeChoice = localStorage.getItem('debtLiteTheme') === 'dark' ? 'dark' : 'light';
    applyTheme(storedThemePreference);

    themeToggle?.addEventListener('click', function(): void {
        const isDark: boolean = rootElement.classList.contains('dark');
        applyTheme(isDark ? 'light' : 'dark');
    });

    // Menu functionality is now handled by assets/js/menu.js component
    // The menu component handles open/close functionality
    // This file only handles dashboard-specific logic like rendering plans list
});


document.addEventListener('DOMContentLoaded', function (): void {
    // --- Initial Setup ---
    const totalCost: number = 6390.00;
    const monthlyPayment: number = 533.00;
    const numberOfMonths: number = 12;

    const tableBody: HTMLElement | null = document.getElementById('payment-table-body');
    const totalPaidEl: HTMLElement | null = document.getElementById('total-paid');
    const remainingBalanceEl: HTMLElement | null = document.getElementById('remaining-balance');
    const totalCostEl: HTMLElement | null = document.getElementById('total-cost');

    // Validate that the required elements exist
    if (!tableBody || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
        console.error('Required DOM elements were not found');
        return;
    }

    // --- Currency Formatter ---
    const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    // --- Generate the Table ---
    function generateTable(): void {
        let tableHTML: string = '';
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
                            <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${payment}" aria-label="Mark month ${i} as paid" role="switch">
                            <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant dark:bg-charcoal-gray peer-focus-visible:ring-offset-pure-white dark:peer-focus-visible:ring-offset-graphite">
                                <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform dark:bg-pure-white"></span>
                            </span>
                            <span class="status-label text-sm font-semibold text-gray-500 dark:text-gray-300 transition-colors duration-300">Pending</span>
                        </label>
                    </td>
                </tr>
            `;
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
            track?.classList.add('bg-lime-vibrant', 'shadow-inner');
            thumb?.classList.add('translate-x-6');
            statusLabel?.classList.remove('text-gray-500', 'dark:text-gray-300');
            statusLabel?.classList.add('text-deep-black', 'dark:text-pure-white');
            statusLabel && (statusLabel.textContent = 'Paid');
            label.setAttribute('data-state', 'paid');
        } else {
            track?.classList.remove('bg-lime-vibrant', 'shadow-inner');
            track?.classList.add('bg-gray-300');
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
        totalPaidEl!.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl!.textContent = currencyFormatter.format(remaining);
        totalCostEl!.textContent = currencyFormatter.format(totalCost);

        return {
            totalPaid: currentTotalPaid,
            remaining
        };
    }

    // --- Save Payment Status to localStorage ---
    function savePaymentStatus(totals?: TotalsSnapshot): void {
        const snapshot: TotalsSnapshot = totals ?? updateTotals();
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        const statusArray: string[] = [];
        paymentToggles.forEach((toggle: HTMLInputElement): void => {
            statusArray.push(toggle.checked ? 'paid' : 'pending');
        });
        localStorage.setItem('paymentStatus', JSON.stringify(statusArray));
        localStorage.setItem('paymentTotals', JSON.stringify(snapshot));
    }

    // --- Load Payment Status from localStorage ---
    function loadPaymentStatus(): void {
        const savedStatus: string | null = localStorage.getItem('paymentStatus');
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
    // --- Initialization and Event Listeners ---
    generateTable();
    loadPaymentStatus(); // Load saved status
    const initialTotals: TotalsSnapshot = updateTotals(); // Calculate initial totals
    savePaymentStatus(initialTotals); // Persist snapshot

    // Update totals when a toggle changes and persist automatically
    tableBody!.addEventListener('change', function(event: Event): void {
        const target: EventTarget | null = event.target;
        if (target instanceof HTMLInputElement && target.classList.contains('payment-toggle')) {
            const updatedTotals: TotalsSnapshot = updateTotals();
            savePaymentStatus(updatedTotals);
        }
    });

    // Clear Records button
    const clearBtn: HTMLElement | null = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(): void {
            if (confirm('Are you sure you want to clear the payment records?')) {
                localStorage.removeItem('paymentStatus');
                localStorage.removeItem('paymentTotals');
                location.reload();
            }
        });
    }

    // --- Light/Dark Theme Toggle ---
    type ThemeChoice = 'light' | 'dark';

    const themeToggle: HTMLButtonElement | null = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const themeLabel: HTMLElement | null = document.getElementById('theme-toggle-label');
    const dashboardLogo: HTMLImageElement | null = document.getElementById('dashboard-logo') as HTMLImageElement | null;
    const rootElement: HTMLElement = document.documentElement;

    function updateThemeToggleUI(theme: ThemeChoice): void {
        themeToggle?.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle?.setAttribute('data-theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }

    function updateLogo(theme: ThemeChoice): void {
        if (!dashboardLogo) {
            return;
        }
        const lightSrc: string | undefined = dashboardLogo.dataset.logoLight;
        const darkSrc: string | undefined = dashboardLogo.dataset.logoDark;
        const nextSrc: string | undefined = theme === 'dark' ? darkSrc : lightSrc;
        if (nextSrc) {
            dashboardLogo.setAttribute('src', nextSrc);
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
});


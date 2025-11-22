import type { Plan } from '../../types/index.js';
import { formatCurrency } from '../../utils/formatters.js';

/**
 * Payment Table Component
 * Handles rendering and interaction with the payment table
 */
export class PaymentTableComponent {
    private tableBody: HTMLElement | null;
    private plan: Plan | null = null;
    private onToggleChange?: (monthIndex: number, isChecked: boolean) => void;

    constructor(tableBodyId: string) {
        this.tableBody = document.getElementById(tableBodyId);
    }

    /**
     * Set the plan for this table
     * @param plan - Plan to display
     */
    setPlan(plan: Plan): void {
        this.plan = plan;
    }

    /**
     * Set callback for toggle changes
     * @param callback - Callback function
     */
    setOnToggleChange(callback: (monthIndex: number, isChecked: boolean) => void): void {
        this.onToggleChange = callback;
    }

    /**
     * Generate and render the payment table
     */
    render(): void {
        if (!this.tableBody || !this.plan) {
            return;
        }

        const isOneTimePayment = this.plan.numberOfMonths === 'one-time';
        const totalCost = this.plan.totalAmount;
        const monthlyPayment = this.plan.monthlyPayment;
        const numberOfMonths = isOneTimePayment ? 1 : this.plan.numberOfMonths;

        let tableHTML = '';

        if (isOneTimePayment) {
            // One-time payment: single row
            tableHTML += this.renderOneTimePaymentRow(totalCost);
        } else {
            // Monthly payments
            const totalMonths = typeof numberOfMonths === 'number' ? numberOfMonths : 1;
            for (let i = 1; i <= totalMonths; i++) {
                // Adjust the final payment so the total matches exactly
                const payment = (i === totalMonths)
                    ? (totalCost - (monthlyPayment * (totalMonths - 1)))
                    : monthlyPayment;

                const isLastRow = i === totalMonths;
                tableHTML += this.renderMonthlyPaymentRow(i, payment, isLastRow);
            }
        }

        this.tableBody.innerHTML = tableHTML;
        this.attachEventListeners();
    }

    /**
     * Render one-time payment row
     */
    private renderOneTimePaymentRow(totalCost: number): string {
        return `
            <tr class="border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60">
                <td class="py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white">
                    <span class="font-medium text-deep-black dark:text-pure-white">One-time Payment</span>
                </td>
                <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${formatCurrency(totalCost)}</td>
                <td class="py-4 px-4 md:px-6 text-center rounded-br-3xl">
                    ${this.renderToggle(0, totalCost, 'Mark payment as paid')}
                </td>
            </tr>
        `;
    }

    /**
     * Render monthly payment row
     */
    private renderMonthlyPaymentRow(monthNumber: number, payment: number, isLastRow: boolean): string {
        const rowClasses = isLastRow
            ? 'border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60'
            : 'border-b border-gray-200 hover:bg-soft-gray/40 transition-colors dark:border-charcoal-gray/50 dark:hover:bg-charcoal-gray/60';
        const firstCellClasses = isLastRow
            ? 'py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white'
            : 'py-4 px-4 md:px-6 text-left whitespace-nowrap text-deep-black dark:text-pure-white';
        const lastCellClasses = isLastRow
            ? 'py-4 px-4 md:px-6 text-center rounded-br-3xl'
            : 'py-4 px-4 md:px-6 text-center';

        return `
            <tr class="${rowClasses}">
                <td class="${firstCellClasses}">
                    <span class="font-medium text-deep-black dark:text-pure-white">Month ${monthNumber}</span>
                </td>
                <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${formatCurrency(payment)}</td>
                <td class="${lastCellClasses}">
                    ${this.renderToggle(monthNumber - 1, payment, `Mark month ${monthNumber} as paid`)}
                </td>
            </tr>
        `;
    }

    /**
     * Render toggle switch
     */
    private renderToggle(monthIndex: number, amount: number, ariaLabel: string): string {
        return `
            <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center text-deep-black dark:text-pure-white">
                <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${amount}" data-month-index="${monthIndex}" aria-label="${ariaLabel}" role="switch">
                <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant dark:bg-charcoal-gray peer-focus-visible:ring-offset-pure-white dark:peer-focus-visible:ring-offset-graphite">
                    <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform dark:bg-pure-white"></span>
                </span>
                <span class="status-label text-sm font-semibold text-gray-500 dark:text-gray-300 transition-colors duration-300">Pending</span>
            </label>
        `;
    }

    /**
     * Attach event listeners to toggles
     */
    private attachEventListeners(): void {
        if (!this.tableBody) {
            return;
        }

        const toggles = this.tableBody.querySelectorAll<HTMLInputElement>('.payment-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const monthIndex = parseInt(toggle.dataset.monthIndex || '0', 10);
                const isChecked = toggle.checked;
                
                if (this.onToggleChange) {
                    this.onToggleChange(monthIndex, isChecked);
                }
            });
        });
    }

    /**
     * Update toggle visual state
     * @param toggle - Toggle input element
     */
    updateToggleVisual(toggle: HTMLInputElement): void {
        const label = toggle.closest('label');
        if (!label) {
            return;
        }

        const track = label.querySelector<HTMLElement>('.toggle-track');
        const thumb = label.querySelector<HTMLElement>('.toggle-thumb');
        const statusLabel = label.querySelector<HTMLElement>('.status-label');

        if (toggle.checked) {
            track?.classList.remove('bg-gray-300', 'dark:bg-charcoal-gray');
            track?.classList.add('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            thumb?.classList.add('translate-x-6');
            statusLabel?.classList.remove('text-gray-500', 'dark:text-gray-300');
            statusLabel?.classList.add('text-deep-black', 'dark:text-pure-white');
            if (statusLabel) statusLabel.textContent = 'Paid';
            label.setAttribute('data-state', 'paid');
        } else {
            track?.classList.remove('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            track?.classList.add('bg-gray-300', 'dark:bg-charcoal-gray');
            thumb?.classList.remove('translate-x-6');
            statusLabel?.classList.remove('text-deep-black', 'dark:text-pure-white');
            statusLabel?.classList.add('text-gray-500', 'dark:text-gray-300');
            if (statusLabel) statusLabel.textContent = 'Pending';
            label.setAttribute('data-state', 'pending');
        }
    }

    /**
     * Load payment status from saved data
     * @param statusArray - Array of payment statuses
     */
    loadPaymentStatus(statusArray: string[]): void {
        if (!this.tableBody) {
            return;
        }

        const toggles = this.tableBody.querySelectorAll<HTMLInputElement>('.payment-toggle');
        toggles.forEach((toggle, idx) => {
            if (statusArray[idx]) {
                const status = statusArray[idx];
                toggle.checked = status === 'paid' || status === 'pagado';
            }
            this.updateToggleVisual(toggle);
        });
    }

    /**
     * Get all payment toggles
     * @returns NodeList of payment toggle inputs
     */
    getPaymentToggles(): NodeListOf<HTMLInputElement> {
        if (!this.tableBody) {
            return document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        }
        return this.tableBody.querySelectorAll<HTMLInputElement>('.payment-toggle');
    }
}


/**
 * Payment Table Component
 * Handles rendering and interaction with the payment table
 */
import { formatCurrency } from '../utils/formatters';
import { StorageService } from '../services/storage';
export class PaymentTable {
    constructor(tableBody, totalPaidEl, remainingBalanceEl, totalCostEl, plan) {
        this.tableBody = tableBody;
        this.totalPaidEl = totalPaidEl;
        this.remainingBalanceEl = remainingBalanceEl;
        this.totalCostEl = totalCostEl;
        this.plan = plan;
    }
    /**
     * Generate and render the payment table
     */
    generateTable() {
        const numberOfMonths = this.plan.numberOfMonths === 'one-time' ? 1 : this.plan.numberOfMonths;
        const isOneTimePayment = this.plan.numberOfMonths === 'one-time';
        let tableHTML = '';
        if (isOneTimePayment) {
            tableHTML = this.renderOneTimePayment();
        }
        else {
            tableHTML = this.renderMonthlyPayments(numberOfMonths);
        }
        this.tableBody.innerHTML = tableHTML;
    }
    /**
     * Render one-time payment row
     */
    renderOneTimePayment() {
        return `
            <tr class="border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60">
                <td class="py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white">
                    <span class="font-medium text-deep-black dark:text-pure-white">One-time Payment</span>
                </td>
                <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${formatCurrency(this.plan.totalAmount)}</td>
                <td class="py-4 px-4 md:px-6 text-center rounded-br-3xl">
                    <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center text-deep-black dark:text-pure-white">
                        <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${this.plan.totalAmount}" data-month-index="0" aria-label="Mark payment as paid" role="switch">
                        <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant dark:bg-charcoal-gray peer-focus-visible:ring-offset-pure-white dark:peer-focus-visible:ring-offset-graphite">
                            <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform dark:bg-pure-white"></span>
                        </span>
                        <span class="status-label text-sm font-semibold text-gray-500 dark:text-gray-300 transition-colors duration-300">Pending</span>
                    </label>
                </td>
            </tr>
        `;
    }
    /**
     * Render monthly payments rows
     */
    renderMonthlyPayments(numberOfMonths) {
        let tableHTML = '';
        const monthlyPayment = this.plan.monthlyPayment;
        for (let i = 1; i <= numberOfMonths; i++) {
            const payment = (i === numberOfMonths)
                ? (this.plan.totalAmount - (monthlyPayment * (numberOfMonths - 1)))
                : monthlyPayment;
            const isLastRow = i === numberOfMonths;
            const rowClasses = isLastRow
                ? 'border-b-0 hover:bg-soft-gray/40 transition-colors dark:hover:bg-charcoal-gray/60'
                : 'border-b border-gray-200 hover:bg-soft-gray/40 transition-colors dark:border-charcoal-gray/50 dark:hover:bg-charcoal-gray/60';
            const firstCellClasses = isLastRow
                ? 'py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl text-deep-black dark:text-pure-white'
                : 'py-4 px-4 md:px-6 text-left whitespace-nowrap text-deep-black dark:text-pure-white';
            const lastCellClasses = isLastRow
                ? 'py-4 px-4 md:px-6 text-center rounded-br-3xl'
                : 'py-4 px-4 md:px-6 text-center';
            tableHTML += `
                <tr class="${rowClasses}">
                    <td class="${firstCellClasses}">
                        <span class="font-medium text-deep-black dark:text-pure-white">Month ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black dark:text-pure-white font-semibold">${formatCurrency(payment)}</td>
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
        return tableHTML;
    }
    /**
     * Update toggle visual state
     */
    updateToggleVisual(toggle) {
        const label = toggle.closest('label');
        if (!label)
            return;
        const track = label.querySelector('.toggle-track');
        const thumb = label.querySelector('.toggle-thumb');
        const statusLabel = label.querySelector('.status-label');
        if (toggle.checked) {
            track?.classList.remove('bg-gray-300', 'dark:bg-charcoal-gray');
            track?.classList.add('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            thumb?.classList.add('translate-x-6');
            statusLabel?.classList.remove('text-gray-500', 'dark:text-gray-300');
            statusLabel?.classList.add('text-deep-black', 'dark:text-pure-white');
            if (statusLabel)
                statusLabel.textContent = 'Paid';
            label.setAttribute('data-state', 'paid');
        }
        else {
            track?.classList.remove('bg-lime-vibrant', 'dark:bg-lime-vibrant/90', 'shadow-inner');
            track?.classList.add('bg-gray-300', 'dark:bg-charcoal-gray');
            thumb?.classList.remove('translate-x-6');
            statusLabel?.classList.remove('text-deep-black', 'dark:text-pure-white');
            statusLabel?.classList.add('text-gray-500', 'dark:text-gray-300');
            if (statusLabel)
                statusLabel.textContent = 'Pending';
            label.setAttribute('data-state', 'pending');
        }
    }
    /**
     * Calculate and update totals
     */
    updateTotals() {
        let currentTotalPaid = 0;
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        paymentToggles.forEach((toggle) => {
            if (toggle.checked) {
                const amount = toggle.dataset.amount;
                if (amount) {
                    currentTotalPaid += parseFloat(amount);
                }
            }
            this.updateToggleVisual(toggle);
        });
        const remaining = this.plan.totalAmount - currentTotalPaid;
        // Update DOM elements
        this.totalPaidEl.textContent = formatCurrency(currentTotalPaid);
        this.remainingBalanceEl.textContent = formatCurrency(remaining);
        this.totalCostEl.textContent = formatCurrency(this.plan.totalAmount);
        return {
            totalPaid: currentTotalPaid,
            remaining
        };
    }
    /**
     * Load payment status from storage
     */
    loadPaymentStatus() {
        const savedStatus = StorageService.getPaymentStatus(this.plan.id);
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        paymentToggles.forEach((toggle, idx) => {
            if (savedStatus[idx]) {
                const status = savedStatus[idx];
                toggle.checked = status === 'paid' || status === 'pagado';
            }
            this.updateToggleVisual(toggle);
        });
    }
    /**
     * Save payment status to storage
     */
    savePaymentStatus(totals) {
        const snapshot = totals ?? this.updateTotals();
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        const statusArray = [];
        paymentToggles.forEach((toggle) => {
            statusArray.push(toggle.checked ? 'paid' : 'pending');
        });
        StorageService.savePaymentStatus(this.plan.id, statusArray);
        StorageService.setItem(`paymentTotals_${this.plan.id}`, snapshot);
    }
    /**
     * Handle automatic month marking
     */
    handleMonthMarking(event) {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.classList.contains('payment-toggle')) {
            return;
        }
        const monthIndex = parseInt(target.dataset.monthIndex || '0', 10);
        const isChecked = target.checked;
        const allToggles = document.querySelectorAll('.payment-toggle');
        if (isChecked) {
            // Mark all previous months
            allToggles.forEach((toggle) => {
                const toggleIndex = parseInt(toggle.dataset.monthIndex || '0', 10);
                if (toggleIndex <= monthIndex && !toggle.checked) {
                    toggle.checked = true;
                    this.updateToggleVisual(toggle);
                }
            });
        }
        else {
            // Unmark all following months
            allToggles.forEach((toggle) => {
                const toggleIndex = parseInt(toggle.dataset.monthIndex || '0', 10);
                if (toggleIndex >= monthIndex && toggle.checked) {
                    toggle.checked = false;
                    this.updateToggleVisual(toggle);
                }
            });
        }
        const updatedTotals = this.updateTotals();
        this.savePaymentStatus(updatedTotals);
    }
}

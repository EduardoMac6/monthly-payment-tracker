"use strict";
document.addEventListener('DOMContentLoaded', function () {
    // --- Initial Setup ---
    const totalCost = 6390.00;
    const monthlyPayment = 533.00;
    const numberOfMonths = 12;
    const tableBody = document.getElementById('payment-table-body');
    const totalPaidEl = document.getElementById('total-paid');
    const remainingBalanceEl = document.getElementById('remaining-balance');
    const totalCostEl = document.getElementById('total-cost');
    // Validate that the required elements exist
    if (!tableBody || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
        console.error('Required DOM elements were not found');
        return;
    }
    // --- Currency Formatter ---
    const currencyFormatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
    // --- Generate the Table ---
    function generateTable() {
        let tableHTML = '';
        for (let i = 1; i <= numberOfMonths; i++) {
            // Adjust the final payment so the total matches exactly
            const payment = (i === numberOfMonths)
                ? (totalCost - (monthlyPayment * (numberOfMonths - 1)))
                : monthlyPayment;
            // Special classes for the last row (rounded bottom corners)
            const isLastRow = i === numberOfMonths;
            const rowClasses = isLastRow
                ? 'border-b-0 hover:bg-light-gray transition-colors'
                : 'border-b border-gray-200 hover:bg-light-gray transition-colors';
            const firstCellClasses = isLastRow
                ? 'py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl'
                : 'py-4 px-4 md:px-6 text-left whitespace-nowrap';
            const lastCellClasses = isLastRow
                ? 'py-4 px-4 md:px-6 text-center rounded-br-3xl'
                : 'py-4 px-4 md:px-6 text-center';
            tableHTML += `
                <tr class="${rowClasses}">
                    <td class="${firstCellClasses}">
                        <span class="font-medium text-deep-black">Month ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black font-semibold">${currencyFormatter.format(payment)}</td>
                    <td class="${lastCellClasses}">
                        <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center">
                            <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${payment}" aria-label="Mark month ${i} as paid" role="switch">
                            <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant">
                                <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform"></span>
                            </span>
                            <span class="status-label text-sm font-semibold text-gray-500 transition-colors duration-300">Pending</span>
                        </label>
                    </td>
                </tr>
            `;
        }
        tableBody.innerHTML = tableHTML;
    }
    function updateToggleVisual(toggle) {
        const label = toggle.closest('label');
        if (!label) {
            return;
        }
        const track = label.querySelector('.toggle-track');
        const thumb = label.querySelector('.toggle-thumb');
        const statusLabel = label.querySelector('.status-label');
        if (toggle.checked) {
            track?.classList.remove('bg-gray-300');
            track?.classList.add('bg-lime-vibrant', 'shadow-inner');
            thumb?.classList.add('translate-x-6');
            statusLabel?.classList.remove('text-gray-500');
            statusLabel?.classList.add('text-deep-black');
            statusLabel && (statusLabel.textContent = 'Paid');
            label.setAttribute('data-state', 'paid');
        }
        else {
            track?.classList.remove('bg-lime-vibrant', 'shadow-inner');
            track?.classList.add('bg-gray-300');
            thumb?.classList.remove('translate-x-6');
            statusLabel?.classList.remove('text-deep-black');
            statusLabel?.classList.add('text-gray-500');
            statusLabel && (statusLabel.textContent = 'Pending');
            label.setAttribute('data-state', 'pending');
        }
    }
    function updateTotals() {
        let currentTotalPaid = 0;
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        paymentToggles.forEach((toggle) => {
            if (toggle.checked) {
                const amount = toggle.dataset.amount;
                if (amount) {
                    currentTotalPaid += parseFloat(amount);
                }
            }
            updateToggleVisual(toggle);
        });
        const remaining = totalCost - currentTotalPaid;
        // Update DOM elements with formatted values
        totalPaidEl.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl.textContent = currencyFormatter.format(remaining);
        totalCostEl.textContent = currencyFormatter.format(totalCost);
        return {
            totalPaid: currentTotalPaid,
            remaining
        };
    }
    // --- Save Payment Status to localStorage ---
    function savePaymentStatus(totals) {
        const snapshot = totals ?? updateTotals();
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        const statusArray = [];
        paymentToggles.forEach((toggle) => {
            statusArray.push(toggle.checked ? 'paid' : 'pending');
        });
        localStorage.setItem('paymentStatus', JSON.stringify(statusArray));
        localStorage.setItem('paymentTotals', JSON.stringify(snapshot));
    }
    // --- Load Payment Status from localStorage ---
    function loadPaymentStatus() {
        const savedStatus = localStorage.getItem('paymentStatus');
        const statusArray = savedStatus ? JSON.parse(savedStatus) : [];
        const paymentToggles = document.querySelectorAll('.payment-toggle');
        paymentToggles.forEach((toggle, idx) => {
            if (statusArray[idx]) {
                const status = statusArray[idx];
                toggle.checked = status === 'paid' || status === 'pagado';
            }
            updateToggleVisual(toggle);
        });
    }
    // --- Initialization and Event Listeners ---
    generateTable();
    loadPaymentStatus(); // Load saved status
    const initialTotals = updateTotals(); // Calculate initial totals
    savePaymentStatus(initialTotals); // Persist snapshot
    // Update totals when a toggle changes, but do not save automatically
    tableBody.addEventListener('change', function (event) {
        const target = event.target;
        if (target instanceof HTMLInputElement && target.classList.contains('payment-toggle')) {
            const updatedTotals = updateTotals();
            savePaymentStatus(updatedTotals);
        }
    });
    // Clear Records button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to clear the payment records?')) {
                localStorage.removeItem('paymentStatus');
                location.reload();
            }
        });
    }
    // --- Light/Dark Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            body.classList.toggle('dark-mode');
        });
    }
});

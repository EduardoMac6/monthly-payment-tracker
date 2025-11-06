"use strict";
document.addEventListener('DOMContentLoaded', function () {
    // --- Configuración Inicial ---
    const totalCost = 6390.00;
    const monthlyPayment = 533.00;
    const numberOfMonths = 12;
    const tableBody = document.getElementById('payment-table-body');
    const totalPaidEl = document.getElementById('total-paid');
    const remainingBalanceEl = document.getElementById('remaining-balance');
    const totalCostEl = document.getElementById('total-cost');
    // Validar que los elementos existan
    if (!tableBody || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
        console.error('No se encontraron los elementos necesarios en el DOM');
        return;
    }
    // --- Formateador de Moneda ---
    const currencyFormatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
    // --- Función para Generar la Tabla ---
    function generateTable() {
        let tableHTML = '';
        for (let i = 1; i <= numberOfMonths; i++) {
            // Ajuste para el último pago para que el total sea exacto
            const payment = (i === numberOfMonths)
                ? (totalCost - (monthlyPayment * (numberOfMonths - 1)))
                : monthlyPayment;
            // Clases especiales para la última fila (esquinas redondeadas inferiores)
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
                        <span class="font-medium text-deep-black">Mes ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black font-semibold">${currencyFormatter.format(payment)}</td>
                    <td class="${lastCellClasses}">
                        <select class="payment-status bg-pure-white border-2 border-gray-300 text-deep-black text-sm rounded-2xl focus:ring-2 focus:ring-lime-vibrant focus:border-lime-vibrant block w-full p-3 font-medium transition-all" data-amount="${payment}">
                            <option value="pendiente" selected>Pendiente</option>
                            <option value="pagado">Pagado</option>
                        </select>
                    </td>
                </tr>
            `;
        }
        tableBody.innerHTML = tableHTML;
    }
    // --- Función para Calcular y Actualizar Totales ---
    function updateTotals() {
        let currentTotalPaid = 0;
        const paymentSelects = document.querySelectorAll('.payment-status');
        paymentSelects.forEach((select) => {
            if (select.value === 'pagado') {
                const amount = select.dataset.amount;
                if (amount) {
                    currentTotalPaid += parseFloat(amount);
                }
            }
            // Cambiar color del select según el estado
            if (select.value === 'pagado') {
                select.classList.remove('bg-pure-white', 'border-gray-300');
                select.classList.add('bg-lime-vibrant', 'border-lime-vibrant', 'text-deep-black', 'font-semibold');
            }
            else {
                select.classList.remove('bg-lime-vibrant', 'border-lime-vibrant', 'text-deep-black', 'font-semibold');
                select.classList.add('bg-pure-white', 'border-gray-300');
            }
        });
        const remaining = totalCost - currentTotalPaid;
        // Actualizar los elementos del DOM con formato
        totalPaidEl.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl.textContent = currencyFormatter.format(remaining);
        totalCostEl.textContent = currencyFormatter.format(totalCost);
    }
    // --- Función para Guardar Estado en localStorage ---
    function savePaymentStatus() {
        const paymentSelects = document.querySelectorAll('.payment-status');
        const statusArray = [];
        paymentSelects.forEach((select) => {
            statusArray.push(select.value);
        });
        localStorage.setItem('paymentStatus', JSON.stringify(statusArray));
    }
    // --- Función para Cargar Estado desde localStorage ---
    function loadPaymentStatus() {
        const savedStatus = localStorage.getItem('paymentStatus');
        const statusArray = savedStatus ? JSON.parse(savedStatus) : [];
        const paymentSelects = document.querySelectorAll('.payment-status');
        paymentSelects.forEach((select, idx) => {
            if (statusArray[idx]) {
                select.value = statusArray[idx];
            }
        });
    }
    // --- Inicialización y Event Listeners ---
    generateTable();
    loadPaymentStatus(); // Cargar estado guardado
    updateTotals(); // Calcular totales iniciales
    // Actualiza totales al cambiar el estado, pero NO guarda automáticamente
    tableBody.addEventListener('change', function (event) {
        const target = event.target;
        if (target instanceof HTMLSelectElement && target.classList.contains('payment-status')) {
            updateTotals();
        }
    });
    // Botón Guardar
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            savePaymentStatus();
            alert('¡Registro guardado!');
        });
    }
    // Botón Borrar Registro
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (confirm('¿Seguro que deseas borrar el registro de pagos?')) {
                localStorage.removeItem('paymentStatus');
                location.reload();
            }
        });
    }
    // --- Tema oscuro/claro ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            body.classList.toggle('dark-mode');
        });
    }
});

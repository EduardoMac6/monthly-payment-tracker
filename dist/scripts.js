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
            tableHTML += `
                <tr class="border-b border-gray-200 hover:bg-gray-100">
                    <td class="py-4 px-4 md:px-6 text-left whitespace-nowrap">
                        <span class="font-medium">Mes ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono">${currencyFormatter.format(payment)}</td>
                    <td class="py-4 px-4 md:px-6 text-center">
                        <select class="payment-status bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" data-amount="${payment}">
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
            select.classList.toggle('bg-green-100', select.value === 'pagado');
            select.classList.toggle('border-green-400', select.value === 'pagado');
            select.classList.toggle('bg-gray-50', select.value === 'pendiente');
            select.classList.toggle('border-gray-300', select.value === 'pendiente');
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

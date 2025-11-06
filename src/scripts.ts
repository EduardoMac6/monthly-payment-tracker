document.addEventListener('DOMContentLoaded', function (): void {
    // --- Configuración Inicial ---
    const totalCost: number = 6390.00;
    const monthlyPayment: number = 533.00;
    const numberOfMonths: number = 12;

    const tableBody: HTMLElement | null = document.getElementById('payment-table-body');
    const totalPaidEl: HTMLElement | null = document.getElementById('total-paid');
    const remainingBalanceEl: HTMLElement | null = document.getElementById('remaining-balance');
    const totalCostEl: HTMLElement | null = document.getElementById('total-cost');

    // Validar que los elementos existan
    if (!tableBody || !totalPaidEl || !remainingBalanceEl || !totalCostEl) {
        console.error('No se encontraron los elementos necesarios en el DOM');
        return;
    }

    // --- Formateador de Moneda ---
    const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    // --- Función para Generar la Tabla ---
    function generateTable(): void {
        let tableHTML: string = '';
        for (let i: number = 1; i <= numberOfMonths; i++) {
            // Ajuste para el último pago para que el total sea exacto
            const payment: number = (i === numberOfMonths) 
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
        tableBody!.innerHTML = tableHTML;
    }

    // --- Función para Calcular y Actualizar Totales ---
    function updateTotals(): void {
        let currentTotalPaid: number = 0;
        const paymentSelects: NodeListOf<HTMLSelectElement> = document.querySelectorAll<HTMLSelectElement>('.payment-status');

        paymentSelects.forEach((select: HTMLSelectElement): void => {
            if (select.value === 'pagado') {
                const amount: string | undefined = select.dataset.amount;
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

        const remaining: number = totalCost - currentTotalPaid;

        // Actualizar los elementos del DOM con formato
        totalPaidEl!.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl!.textContent = currencyFormatter.format(remaining);
        totalCostEl!.textContent = currencyFormatter.format(totalCost);
    }

    // --- Función para Guardar Estado en localStorage ---
    function savePaymentStatus(): void {
        const paymentSelects: NodeListOf<HTMLSelectElement> = document.querySelectorAll<HTMLSelectElement>('.payment-status');
        const statusArray: string[] = [];
        paymentSelects.forEach((select: HTMLSelectElement): void => {
            statusArray.push(select.value);
        });
        localStorage.setItem('paymentStatus', JSON.stringify(statusArray));
    }

    // --- Función para Cargar Estado desde localStorage ---
    function loadPaymentStatus(): void {
        const savedStatus: string | null = localStorage.getItem('paymentStatus');
        const statusArray: string[] = savedStatus ? JSON.parse(savedStatus) : [];
        const paymentSelects: NodeListOf<HTMLSelectElement> = document.querySelectorAll<HTMLSelectElement>('.payment-status');
        paymentSelects.forEach((select: HTMLSelectElement, idx: number): void => {
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
    tableBody!.addEventListener('change', function(event: Event): void {
        const target: EventTarget | null = event.target;
        if (target instanceof HTMLSelectElement && target.classList.contains('payment-status')) {
            updateTotals();
        }
    });

    // Botón Guardar
    const saveBtn: HTMLElement | null = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(): void {
            savePaymentStatus();
            alert('¡Registro guardado!');
        });
    }

    // Botón Borrar Registro
    const clearBtn: HTMLElement | null = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function(): void {
            if (confirm('¿Seguro que deseas borrar el registro de pagos?')) {
                localStorage.removeItem('paymentStatus');
                location.reload();
            }
        });
    }

    // --- Tema oscuro/claro ---
    const themeToggle: HTMLElement | null = document.getElementById('theme-toggle');
    const body: HTMLElement = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', function(): void {
            body.classList.toggle('dark-mode');
        });
    }
});


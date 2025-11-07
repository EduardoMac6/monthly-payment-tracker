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
            
            // Clases especiales para la última fila (esquinas redondeadas inferiores)
            const isLastRow: boolean = i === numberOfMonths;
            const rowClasses: string = isLastRow 
                ? 'border-b-0 hover:bg-light-gray transition-colors' 
                : 'border-b border-gray-200 hover:bg-light-gray transition-colors';
            const firstCellClasses: string = isLastRow 
                ? 'py-4 px-4 md:px-6 text-left whitespace-nowrap rounded-bl-3xl' 
                : 'py-4 px-4 md:px-6 text-left whitespace-nowrap';
            const lastCellClasses: string = isLastRow 
                ? 'py-4 px-4 md:px-6 text-center rounded-br-3xl' 
                : 'py-4 px-4 md:px-6 text-center';
            
            tableHTML += `
                <tr class="${rowClasses}">
                    <td class="${firstCellClasses}">
                        <span class="font-medium text-deep-black">Mes ${i}</span>
                    </td>
                    <td class="py-4 px-4 md:px-6 text-center font-mono text-deep-black font-semibold">${currencyFormatter.format(payment)}</td>
                    <td class="${lastCellClasses}">
                        <label class="inline-flex items-center gap-3 cursor-pointer select-none w-full justify-center">
                            <input type="checkbox" class="payment-toggle sr-only peer" data-amount="${payment}" aria-label="Marcar mes ${i} como pagado" role="switch">
                            <span class="toggle-track relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full bg-gray-300 transition-all duration-300 ease-out peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-lime-vibrant">
                                <span class="toggle-thumb absolute left-1 top-1 h-6 w-6 rounded-full bg-pure-white shadow-md transition-transform duration-300 ease-out transform"></span>
                            </span>
                            <span class="status-label text-sm font-semibold text-gray-500 transition-colors duration-300">Pendiente</span>
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
            statusLabel?.classList.remove('text-gray-500');
            statusLabel?.classList.add('text-deep-black');
            statusLabel && (statusLabel.textContent = 'Pagado');
            label.setAttribute('data-state', 'pagado');
        } else {
            track?.classList.remove('bg-lime-vibrant', 'shadow-inner');
            track?.classList.add('bg-gray-300');
            thumb?.classList.remove('translate-x-6');
            statusLabel?.classList.remove('text-deep-black');
            statusLabel?.classList.add('text-gray-500');
            statusLabel && (statusLabel.textContent = 'Pendiente');
            label.setAttribute('data-state', 'pendiente');
        }
    }

    // --- Función para Calcular y Actualizar Totales ---
    function updateTotals(): void {
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

        // Actualizar los elementos del DOM con formato
        totalPaidEl!.textContent = currencyFormatter.format(currentTotalPaid);
        remainingBalanceEl!.textContent = currencyFormatter.format(remaining);
        totalCostEl!.textContent = currencyFormatter.format(totalCost);
    }

    // --- Función para Guardar Estado en localStorage ---
    function savePaymentStatus(): void {
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        const statusArray: string[] = [];
        paymentToggles.forEach((toggle: HTMLInputElement): void => {
            statusArray.push(toggle.checked ? 'pagado' : 'pendiente');
        });
        localStorage.setItem('paymentStatus', JSON.stringify(statusArray));
    }

    // --- Función para Cargar Estado desde localStorage ---
    function loadPaymentStatus(): void {
        const savedStatus: string | null = localStorage.getItem('paymentStatus');
        const statusArray: string[] = savedStatus ? JSON.parse(savedStatus) : [];
        const paymentToggles: NodeListOf<HTMLInputElement> = document.querySelectorAll<HTMLInputElement>('.payment-toggle');
        paymentToggles.forEach((toggle: HTMLInputElement, idx: number): void => {
            if (statusArray[idx]) {
                toggle.checked = statusArray[idx] === 'pagado';
            }
            updateToggleVisual(toggle);
        });
    }
    

    // --- Inicialización y Event Listeners ---
    generateTable();
    loadPaymentStatus(); // Cargar estado guardado
    updateTotals(); // Calcular totales iniciales

    // Actualiza totales al cambiar el estado, pero NO guarda automáticamente
    tableBody!.addEventListener('change', function(event: Event): void {
        const target: EventTarget | null = event.target;
        if (target instanceof HTMLInputElement && target.classList.contains('payment-toggle')) {
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


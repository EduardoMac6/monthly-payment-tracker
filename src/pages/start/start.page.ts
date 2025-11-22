/**
 * Start Page (Onboarding)
 * Handles the plan creation form
 */

import { PlansService } from '../../services/plans/plans.service.js';
import { FormValidator } from '../../components/form-validator/form-validator.component.js';
import { ToastService } from '../../components/toast/toast.component.js';
import { ErrorHandler } from '../../utils/errors.js';

export class StartPage {
    private planNameInput: HTMLInputElement | null;
    private amountInput: HTMLInputElement | null;
    private monthButtons: NodeListOf<HTMLButtonElement>;
    private ownerButtons: NodeListOf<HTMLButtonElement>;
    private continueBtn: HTMLButtonElement | null;
    private formValidator: FormValidator;

    private selectedMonths: number | 'one-time' | null = null;
    private selectedOwner: 'self' | 'other' | null = null;

    constructor() {
        // Get DOM elements
        this.planNameInput = document.getElementById('plan-name') as HTMLInputElement | null;
        this.amountInput = document.getElementById('amount-input') as HTMLInputElement | null;
        this.monthButtons = document.querySelectorAll<HTMLButtonElement>('.month-button');
        this.ownerButtons = document.querySelectorAll<HTMLButtonElement>('.owner-button');
        this.continueBtn = document.getElementById('continue-btn') as HTMLButtonElement | null;

        // Initialize form validator
        this.formValidator = new FormValidator();

        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Initialize the start page
     */
    init(): void {
        // Initial validation state
        this.updateContinueState();
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners(): void {
        // Plan name input - real-time validation
        if (this.planNameInput) {
            this.planNameInput.addEventListener('input', () => {
                this.formValidator.validatePlanName(this.planNameInput!, false);
                this.updateContinueState();
            });

            this.planNameInput.addEventListener('blur', () => {
                this.formValidator.validatePlanName(this.planNameInput!, true);
            });
        }

        // Amount input - real-time validation
        if (this.amountInput) {
            this.amountInput.addEventListener('input', () => {
                this.formValidator.validateAmount(this.amountInput!, false);
                this.updateContinueState();
            });

            this.amountInput.addEventListener('blur', () => {
                this.formValidator.validateAmount(this.amountInput!, true);
            });
        }

        // Owner buttons
        this.ownerButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.selectedOwner = button.dataset.owner as 'self' | 'other';
                this.updateOwnerButtons();
                this.updateContinueState();
            });
        });

        // Month buttons
        this.monthButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const monthsValue = button.dataset.months;
                this.selectedMonths = monthsValue === 'one-time' ? 'one-time' : parseInt(monthsValue || '0', 10);
                this.updateMonthButtons();
                this.updateContinueState();
            });
        });

        // Continue button
        if (this.continueBtn) {
            this.continueBtn.addEventListener('click', () => {
                this.handleContinue();
            });
        }
    }

    /**
     * Update owner buttons visual state
     */
    private updateOwnerButtons(): void {
        this.ownerButtons.forEach((btn) => {
            const isActive = btn.dataset.owner === this.selectedOwner;
            
            // Remove all state classes and inline styles
            btn.classList.remove('bg-lime-vibrant', 'bg-soft-gray/40', 'dark:bg-charcoal-gray/50');
            btn.style.backgroundColor = '';
            btn.style.color = '';
            
            if (isActive) {
                // Active state: lime-vibrant background (#A4EA01) with deep-black text
                btn.style.backgroundColor = '#A4EA01';
                btn.style.color = '#1A1A1A';
                btn.classList.add('bg-lime-vibrant', 'text-deep-black');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                // Inactive state: use Tailwind classes
                btn.classList.add('bg-soft-gray/40', 'dark:bg-charcoal-gray/50', 'text-deep-black', 'dark:text-pure-white');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    /**
     * Update month buttons visual state
     */
    private updateMonthButtons(): void {
        this.monthButtons.forEach((btn) => {
            const monthsValue = this.selectedMonths === 'one-time' ? 'one-time' : this.selectedMonths?.toString();
            const isActive = btn.dataset.months === monthsValue;
            
            // Remove all state classes and inline styles
            btn.classList.remove('bg-lime-vibrant', 'bg-soft-gray/40', 'dark:bg-charcoal-gray/50');
            btn.style.backgroundColor = '';
            btn.style.color = '';
            
            if (isActive) {
                // Active state: lime-vibrant background (#A4EA01) with deep-black text
                btn.style.backgroundColor = '#A4EA01';
                btn.style.color = '#1A1A1A';
                btn.classList.add('bg-lime-vibrant', 'text-deep-black');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                // Inactive state: use Tailwind classes
                btn.classList.add('bg-soft-gray/40', 'dark:bg-charcoal-gray/50', 'text-deep-black', 'dark:text-pure-white');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    /**
     * Update continue button state based on form validity
     */
    private updateContinueState(): void {
        if (!this.continueBtn || !this.planNameInput || !this.amountInput) {
            return;
        }

        const nameResult = this.formValidator.validatePlanName(this.planNameInput, false);
        const amountResult = this.formValidator.validateAmount(this.amountInput, false);
        const monthsResult = this.formValidator.validateMonths(this.selectedMonths, false);

        const isValid = nameResult.isValid && 
                        amountResult.isValid && 
                        monthsResult.isValid && 
                        this.selectedOwner !== null;

        this.continueBtn.disabled = !isValid;
    }

    /**
     * Handle continue button click
     */
    private async handleContinue(): Promise<void> {
        if (!this.continueBtn || this.continueBtn.disabled) {
            return;
        }

        if (!this.planNameInput || !this.amountInput) {
            return;
        }

        // Final validation
        const nameResult = this.formValidator.validatePlanName(this.planNameInput, true);
        const amountResult = this.formValidator.validateAmount(this.amountInput, true);
        const monthsResult = this.formValidator.validateMonths(this.selectedMonths, true);

        if (!nameResult.isValid || !amountResult.isValid || !monthsResult.isValid || !this.selectedOwner) {
            ToastService.error('Por favor, completa todos los campos correctamente');
            return;
        }

        const amountValue = parseFloat(this.amountInput.value);

        try {
            // Create plan using PlansService
            const newPlan = await PlansService.createPlan({
                planName: this.planNameInput.value.trim(),
                totalAmount: amountValue,
                numberOfMonths: this.selectedMonths!,
                debtOwner: this.selectedOwner
            });

            console.log('Plan creado exitosamente:', newPlan);
            ToastService.success('Plan creado exitosamente');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } catch (error) {
            console.error('Error al crear el plan:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            ToastService.error(`Error al guardar el plan: ${errorMessage}`);
            ErrorHandler.handle(
                error instanceof Error ? error : new Error('Unknown error'),
                'StartPage.handleContinue'
            );
        }
    }
}


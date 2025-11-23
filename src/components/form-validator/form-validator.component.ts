/**
 * Form Validator Component
 * Handles real-time validation and error display for form inputs
 */

import { PlanValidator } from '../../utils/validators.js';
import type { ValidationResult } from '../../utils/validators.js';

export class FormValidator {
    private errorContainer: HTMLElement | null = null;

    constructor(errorContainerId?: string) {
        if (errorContainerId) {
            this.errorContainer = document.getElementById(errorContainerId);
        }
    }

    /**
     * Validate and show error for plan name input
     * @param input - Input element
     * @param showError - Whether to show error message
     * @returns Validation result
     */
    validatePlanName(input: HTMLInputElement, showError: boolean = true): ValidationResult {
        const value = input.value.trim();
        const result = PlanValidator.validatePlanName(value);

        if (showError) {
            this.showFieldError(input, result.error);
        }

        return result;
    }

    /**
     * Validate and show error for amount input
     * @param input - Input element
     * @param showError - Whether to show error message
     * @returns Validation result
     */
    validateAmount(input: HTMLInputElement, showError: boolean = true): ValidationResult {
        const value = parseFloat(input.value);
        const result = PlanValidator.validateAmount(value);

        if (showError) {
            this.showFieldError(input, result.error);
        }

        return result;
    }

    /**
     * Validate and show error for months selection
     * @param months - Selected months value
     * @param showError - Whether to show error message
     * @returns Validation result
     */
    validateMonths(
        months: number | 'one-time' | null,
        showError: boolean = true
    ): ValidationResult {
        if (months === null) {
            const result: ValidationResult = {
                isValid: false,
                error: 'Please select a payment period',
            };
            if (showError && this.errorContainer) {
                this.showContainerError(result.error);
            }
            return result;
        }

        const result = PlanValidator.validateMonths(months);

        if (showError && !result.isValid && this.errorContainer) {
            this.showContainerError(result.error || 'Invalid payment period');
        }

        return result;
    }

    /**
     * Show error message for a specific input field
     * @param input - Input element
     * @param errorMessage - Error message to display
     */
    showFieldError(input: HTMLInputElement, errorMessage?: string): void {
        // Remove existing error
        this.clearFieldError(input);

        if (!errorMessage) {
            // No error, mark as valid
            input.classList.remove('border-red-500', 'dark:border-red-500');
            input.classList.add('border-soft-gray', 'dark:border-charcoal-gray');
            return;
        }

        // Mark as invalid
        input.classList.remove('border-soft-gray', 'dark:border-charcoal-gray');
        input.classList.add('border-red-500', 'dark:border-red-500');

        // Create error message element
        const errorId = `${input.id}-error`;
        let errorElement = document.getElementById(errorId);

        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.id = errorId;
            errorElement.className = 'mt-1 text-xs text-red-600 dark:text-red-400';
            errorElement.setAttribute('role', 'alert');

            // Insert after input or its parent
            const parent = input.parentElement;
            if (parent) {
                parent.appendChild(errorElement);
            } else {
                input.insertAdjacentElement('afterend', errorElement);
            }
        }

        errorElement.textContent = errorMessage;
    }

    /**
     * Clear error message for a specific input field
     * @param input - Input element
     */
    clearFieldError(input: HTMLInputElement): void {
        input.classList.remove('border-red-500', 'dark:border-red-500');
        input.classList.add('border-soft-gray', 'dark:border-charcoal-gray');

        const errorId = `${input.id}-error`;
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Show error message in container
     * @param errorMessage - Error message to display
     */
    showContainerError(errorMessage: string | undefined): void {
        if (!this.errorContainer || !errorMessage) {
            return;
        }

        this.errorContainer.className =
            'mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
        this.errorContainer.innerHTML = `
            <p class="text-sm text-red-600 dark:text-red-400" role="alert">
                ${this.escapeHtml(errorMessage)}
            </p>
        `;
        this.errorContainer.style.display = 'block';
    }

    /**
     * Clear container error
     */
    clearContainerError(): void {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Error State Component
 * Displays user-friendly error messages
 */

export interface ErrorStateOptions {
    title?: string;
    message: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export class ErrorStateComponent {
    /**
     * Render an error state
     * @param container - Container element where to render
     * @param options - Error state options
     */
    static render(container: HTMLElement, options: ErrorStateOptions): void {
        const title = options.title || 'Something went wrong';
        const icon = options.icon || this.getDefaultIcon();
        const actionButton = options.actionLabel
            ? `
            <button
                id="error-action-btn"
                class="mt-4 rounded-lg bg-lime-vibrant px-6 py-2 text-sm font-semibold text-deep-black transition hover:bg-pastel-green focus:outline-none focus:ring-2 focus:ring-lime-vibrant focus:ring-offset-2"
            >
                ${options.actionLabel}
            </button>
        `
            : '';

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-center">
                <div class="mb-4 text-6xl">${icon}</div>
                <h3 class="mb-2 text-lg font-semibold text-deep-black dark:text-pure-white">${title}</h3>
                <p class="mb-4 max-w-md text-sm text-deep-black/70 dark:text-pure-white/70">${options.message}</p>
                ${actionButton}
            </div>
        `;

        // Set up action button if provided
        if (options.actionLabel && options.onAction) {
            const actionBtn = container.querySelector('#error-action-btn');
            if (actionBtn) {
                actionBtn.addEventListener('click', options.onAction);
            }
        }
    }

    /**
     * Get default error icon
     */
    private static getDefaultIcon(): string {
        return `
            <svg class="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        `;
    }

    /**
     * Clear error state
     * @param container - Container element
     */
    static clear(container: HTMLElement): void {
        container.innerHTML = '';
    }
}

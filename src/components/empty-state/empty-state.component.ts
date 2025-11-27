/**
 * Empty State Component
 * Displays a message when there's no data to show
 */

export interface EmptyStateOptions {
    title?: string;
    message: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export class EmptyStateComponent {
    /**
     * Render an empty state
     * @param container - Container element where to render
     * @param options - Empty state options
     */
    static render(container: HTMLElement, options: EmptyStateOptions): void {
        const title = options.title || 'No data available';
        const icon = options.icon || this.getDefaultIcon();
        const actionButton = options.actionLabel
            ? `
            <button
                id="empty-action-btn"
                class="mt-4 rounded-lg bg-lime-vibrant px-6 py-2 text-sm font-semibold text-deep-black transition hover:bg-pastel-green focus:outline-none focus:ring-2 focus:ring-lime-vibrant focus:ring-offset-2"
            >
                ${options.actionLabel}
            </button>
        `
            : '';

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center p-8 text-center">
                <div class="mb-4 text-6xl opacity-50">${icon}</div>
                <h3 class="mb-2 text-lg font-semibold text-deep-black dark:text-pure-white">${title}</h3>
                <p class="mb-4 max-w-md text-sm text-deep-black/70 dark:text-pure-white/70">${options.message}</p>
                ${actionButton}
            </div>
        `;

        // Set up action button if provided
        if (options.actionLabel && options.onAction) {
            const actionBtn = container.querySelector('#empty-action-btn');
            if (actionBtn) {
                actionBtn.addEventListener('click', options.onAction);
            }
        }
    }

    /**
     * Get default empty icon
     */
    private static getDefaultIcon(): string {
        return `
            <svg class="mx-auto h-16 w-16 text-deep-black/30 dark:text-pure-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
            </svg>
        `;
    }

    /**
     * Clear empty state
     * @param container - Container element
     */
    static clear(container: HTMLElement): void {
        container.innerHTML = '';
    }
}

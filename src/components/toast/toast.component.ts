/**
 * Toast Notification Component
 * Displays non-intrusive notifications to the user
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number; // Duration in milliseconds, 0 = don't auto-hide
}

export class ToastService {
    private static container: HTMLElement | null = null;
    private static toasts: Map<string, HTMLElement> = new Map();
    private static toastIdCounter = 0;

    /**
     * Initialize toast container
     */
    private static initContainer(): void {
        if (this.container) {
            return;
        }

        // Create container if it doesn't exist
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className =
            'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
        document.body.appendChild(this.container);
    }

    /**
     * Show a toast notification
     * @param options - Toast options
     * @returns Toast ID for manual dismissal
     */
    static show(options: ToastOptions): string {
        this.initContainer();
        if (!this.container) {
            return '';
        }

        const toastId = `toast-${++this.toastIdCounter}`;
        const type = options.type || 'info';
        const duration = options.duration !== undefined ? options.duration : 3000;

        // Create toast element
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = this.getToastClasses(type);
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        // Toast content
        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0">
                    ${this.getIcon(type)}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium">${this.escapeHtml(options.message)}</p>
                </div>
                <button
                    type="button"
                    class="flex-shrink-0 rounded-md p-1.5 text-current hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
                    aria-label="Close notification"
                    onclick="ToastService.hide('${toastId}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        // Add to container
        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-x-full');
            toast.classList.add('opacity-100', 'translate-x-0');
        });

        // Auto-hide if duration is set
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * Hide a toast notification
     * @param toastId - Toast ID to hide
     */
    static hide(toastId: string): void {
        const toast = this.toasts.get(toastId);
        if (!toast) {
            return;
        }

        // Animate out
        toast.classList.remove('opacity-100', 'translate-x-0');
        toast.classList.add('opacity-0', 'translate-x-full');

        // Remove after animation
        setTimeout(() => {
            toast.remove();
            this.toasts.delete(toastId);
        }, 300);
    }

    /**
     * Show success toast
     */
    static success(message: string, duration?: number): string {
        return this.show({ message, type: 'success', duration });
    }

    /**
     * Show error toast
     */
    static error(message: string, duration?: number): string {
        return this.show({ message, type: 'error', duration });
    }

    /**
     * Show info toast
     */
    static info(message: string, duration?: number): string {
        return this.show({ message, type: 'info', duration });
    }

    /**
     * Show warning toast
     */
    static warning(message: string, duration?: number): string {
        return this.show({ message, type: 'warning', duration });
    }

    /**
     * Get toast CSS classes based on type
     */
    private static getToastClasses(type: ToastType): string {
        const baseClasses =
            'pointer-events-auto rounded-lg shadow-lg p-4 transition-all duration-300 transform opacity-0 translate-x-full';

        const typeClasses = {
            success: 'bg-lime-vibrant text-deep-black border border-lime-vibrant/20',
            error: 'bg-red-500 text-white border border-red-600/20 dark:bg-red-600 dark:text-white',
            info: 'bg-blue-500 text-white border border-blue-600/20 dark:bg-blue-600 dark:text-white',
            warning: 'bg-yellow-500 text-deep-black border border-yellow-600/20 dark:bg-yellow-600',
        };

        return `${baseClasses} ${typeClasses[type]}`;
    }

    /**
     * Get icon SVG based on type
     */
    private static getIcon(type: ToastType): string {
        const icons = {
            success: `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
            `,
            error: `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            `,
            info: `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `,
            warning: `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
            `,
        };

        return icons[type];
    }

    /**
     * Escape HTML to prevent XSS
     */
    private static escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Make ToastService available globally for onclick handlers
(window as any).ToastService = ToastService;

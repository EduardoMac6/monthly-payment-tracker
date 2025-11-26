/**
 * Loading Spinner Component
 * Displays a loading spinner for async operations
 */

export interface LoadingOptions {
    message?: string;
    size?: 'small' | 'medium' | 'large';
    fullScreen?: boolean;
}

export class LoadingComponent {
    private static activeLoaders: Map<string, HTMLElement> = new Map();
    private static loaderIdCounter = 0;

    /**
     * Show a loading spinner
     * @param container - Container element where to show the loader, or null for full screen
     * @param options - Loading options
     * @returns Loader ID for manual dismissal
     */
    static show(container: HTMLElement | null = null, options: LoadingOptions = {}): string {
        const loaderId = `loader-${++this.loaderIdCounter}`;
        const message = options.message || 'Loading...';
        const size = options.size || 'medium';
        const fullScreen = options.fullScreen ?? container === null;

        // Create loader element
        const loader = document.createElement('div');
        loader.id = loaderId;
        loader.className = fullScreen
            ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
            : 'flex items-center justify-center p-4';

        const sizeClasses = {
            small: 'w-4 h-4',
            medium: 'w-8 h-8',
            large: 'w-12 h-12',
        };

        loader.innerHTML = `
            <div class="flex flex-col items-center justify-center gap-3">
                <div class="${sizeClasses[size]} animate-spin rounded-full border-4 border-lime-vibrant border-t-transparent"></div>
                ${message ? `<p class="text-sm font-medium text-deep-black dark:text-pure-white">${message}</p>` : ''}
            </div>
        `;

        // Append to container or body
        if (container) {
            container.appendChild(loader);
            container.style.position = 'relative';
        } else {
            document.body.appendChild(loader);
        }

        this.activeLoaders.set(loaderId, loader);
        return loaderId;
    }

    /**
     * Hide a loading spinner
     * @param loaderId - Loader ID returned from show()
     */
    static hide(loaderId: string): void {
        const loader = this.activeLoaders.get(loaderId);
        if (loader) {
            loader.remove();
            this.activeLoaders.delete(loaderId);
        }
    }

    /**
     * Hide all loading spinners
     */
    static hideAll(): void {
        this.activeLoaders.forEach((loader) => loader.remove());
        this.activeLoaders.clear();
    }

    /**
     * Show loading in a container with automatic cleanup
     * @param container - Container element
     * @param asyncOperation - Async operation to execute
     * @param options - Loading options
     */
    static async withLoading<T>(
        container: HTMLElement | null,
        asyncOperation: () => Promise<T>,
        options: LoadingOptions = {}
    ): Promise<T> {
        const loaderId = this.show(container, options);
        try {
            return await asyncOperation();
        } finally {
            this.hide(loaderId);
        }
    }
}

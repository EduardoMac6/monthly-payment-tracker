/**
 * Global type declarations
 * Extends global interfaces like Window with custom properties
 */

import type { ToastService } from '../components/toast/toast.component.js';

/**
 * Extends the global Window interface to include ToastService
 * This allows type-safe access to window.ToastService throughout the application
 */
declare global {
    interface Window {
        ToastService: typeof ToastService;
    }
}

export {};

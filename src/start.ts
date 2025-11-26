/**
 * Start page entry point
 * Initializes the start/onboarding page
 */

import { StartPage } from './pages/start/start.page.js';
import { ToastService } from './components/toast/toast.component.js';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component.js';

// Make ToastService available globally
interface WindowWithToastService extends Window {
    ToastService: typeof ToastService;
}
(window as WindowWithToastService).ToastService = ToastService;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle
    const themeToggle = new ThemeToggleComponent();
    themeToggle.init();

    // Initialize start page
    const startPage = new StartPage();
    startPage.init();
});

/**
 * Start page entry point
 * Initializes the start/onboarding page
 */

import { StartPage } from './pages/start/start.page.js';
import { ToastService } from './components/toast/toast.component.js';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component.js';

// Make ToastService available globally
// Type is now properly declared in src/types/global.d.ts
window.ToastService = ToastService;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme toggle
    const themeToggle = new ThemeToggleComponent();
    themeToggle.init();

    // Initialize start page
    const startPage = new StartPage();
    startPage.init();
});

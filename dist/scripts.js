/**
 * Main entry point for the application
 * This file initializes the dashboard page when DOM is ready
 */
import { DashboardPage } from './pages/dashboard/dashboard.page.js';
import { ToastService } from './components/toast/toast.component.js';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component.js';
// Make ToastService available globally for onclick handlers and error handling
window.ToastService = ToastService;
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme toggle
    const themeToggle = new ThemeToggleComponent();
    themeToggle.init();
    // Initialize dashboard page
    const dashboardPage = new DashboardPage();
    await dashboardPage.init();
});

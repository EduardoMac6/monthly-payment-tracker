/**
 * Main entry point for the application
 * This file initializes the dashboard page when DOM is ready
 */
import { DashboardPage } from './pages/dashboard/dashboard.page.js';
import { ToastService } from './components/toast/toast.component.js';
// Make ToastService available globally for onclick handlers and error handling
window.ToastService = ToastService;
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-toggle-label');
    const dashboardLogo = document.getElementById('dashboard-logo');
    const rootElement = document.documentElement;
    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }
    function updateThemeToggleUI(theme) {
        if (!themeToggle)
            return;
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('data-theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }
    function updateLogo(theme) {
        // Update overview logo
        if (dashboardLogo) {
            const lightSrc = dashboardLogo.dataset.logoLight;
            const darkSrc = dashboardLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                dashboardLogo.setAttribute('src', nextSrc);
            }
        }
        // Update plan detail logo
        const planDetailLogo = document.getElementById('plan-detail-logo');
        if (planDetailLogo) {
            const lightSrc = planDetailLogo.dataset.logoLight;
            const darkSrc = planDetailLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                planDetailLogo.setAttribute('src', nextSrc);
            }
        }
    }
    function applyTheme(theme) {
        console.log('Applying theme:', theme);
        // Force remove first, then add to ensure it works
        rootElement.classList.remove('dark');
        if (theme === 'dark') {
            rootElement.classList.add('dark');
        }
        localStorage.setItem('debtLiteTheme', theme);
        updateThemeToggleUI(theme);
        updateLogo(theme);
        console.log('Theme applied. Dark class present:', rootElement.classList.contains('dark'));
    }
    // Get stored preference or default to light
    const storedThemePreference = localStorage.getItem('debtLiteTheme') === 'dark' ? 'dark' : 'light';
    console.log('Stored theme preference:', storedThemePreference);
    applyTheme(storedThemePreference);
    // Add click event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyDark = rootElement.classList.contains('dark');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            console.log('Theme toggle clicked. Current:', isCurrentlyDark ? 'dark' : 'light', '-> New:', newTheme);
            applyTheme(newTheme);
        });
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    initTheme();
    // Initialize dashboard page
    const dashboardPage = new DashboardPage();
    await dashboardPage.init();
});

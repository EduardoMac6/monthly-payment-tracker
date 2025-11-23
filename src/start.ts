/**
 * Start page entry point
 * Initializes the start/onboarding page
 */

import { StartPage } from './pages/start/start.page.js';
import { ToastService } from './components/toast/toast.component.js';

// Make ToastService available globally
(window as any).ToastService = ToastService;

// Theme management
type ThemeChoice = 'light' | 'dark';

function initTheme(): void {
    const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const themeLabel = document.getElementById('theme-toggle-label');
    const brandLogo = document.getElementById('brand-logo') as HTMLImageElement | null;
    const rootElement = document.documentElement;

    if (!themeToggle) {
        console.warn('Theme toggle button not found');
        return;
    }

    function updateThemeToggleUI(theme: ThemeChoice): void {
        if (!themeToggle) return;
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        themeToggle.setAttribute('data-theme', theme);
        if (themeLabel) {
            themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }

    function updateLogo(theme: ThemeChoice): void {
        if (!brandLogo) return;
        const lightSrc = brandLogo.dataset.logoLight;
        const darkSrc = brandLogo.dataset.logoDark;
        const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
        if (nextSrc) {
            brandLogo.setAttribute('src', nextSrc);
        }
    }

    function applyTheme(theme: ThemeChoice): void {
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
    const storedThemePreference: ThemeChoice =
        localStorage.getItem('debtLiteTheme') === 'dark' ? 'dark' : 'light';
    console.log('Stored theme preference:', storedThemePreference);
    applyTheme(storedThemePreference);

    // Add click event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyDark = rootElement.classList.contains('dark');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            console.log(
                'Theme toggle clicked. Current:',
                isCurrentlyDark ? 'dark' : 'light',
                '-> New:',
                newTheme
            );
            applyTheme(newTheme);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();

    // Initialize start page
    const startPage = new StartPage();
    startPage.init();
});

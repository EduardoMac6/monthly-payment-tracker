/**
 * Theme Toggle Component
 *
 * Manages dark/light theme switching with persistence in localStorage.
 * Updates the UI theme, logo, and toggle button state.
 *
 * @example
 * ```typescript
 * const themeToggle = new ThemeToggleComponent();
 * themeToggle.init(); // Initialize and load saved theme
 * ```
 */

export type ThemeChoice = 'light' | 'dark';

export class ThemeToggleComponent {
    private themeToggle: HTMLButtonElement | null;
    private themeToggleMenu: HTMLButtonElement | null;
    private themeLabel: HTMLElement | null;
    private themeLabelMenu: HTMLElement | null;
    private dashboardLogo: HTMLImageElement | null;
    private rootElement: HTMLElement;

    constructor() {
        this.themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement | null;
        this.themeToggleMenu = document.getElementById(
            'theme-toggle-menu'
        ) as HTMLButtonElement | null;
        this.themeLabel = document.getElementById('theme-toggle-label');
        this.themeLabelMenu = document.getElementById('theme-toggle-label-menu');
        this.dashboardLogo = document.getElementById('dashboard-logo') as HTMLImageElement | null;
        this.rootElement = document.documentElement;
    }

    /**
     * Initialize theme toggle component
     *
     * Loads saved theme preference from localStorage, applies it to the document,
     * and sets up event listeners for theme switching.
     *
     * @returns void
     */
    public init(): void {
        // At least one toggle must exist
        if (!this.themeToggle && !this.themeToggleMenu) {
            console.warn('Theme toggle buttons not found');
            return;
        }

        // Check if theme was already applied by inline script
        const isDarkAlready = this.rootElement.classList.contains('dark');
        const storedThemePreference: ThemeChoice =
            localStorage.getItem('debtLiteTheme') === 'dark' ? 'dark' : 'light';

        // Only apply if not already applied or if there's a mismatch
        if (!isDarkAlready && storedThemePreference === 'dark') {
            this.applyTheme('dark');
        } else if (isDarkAlready && storedThemePreference === 'light') {
            this.applyTheme('light');
        } else {
            // Just update UI to match current state
            this.updateThemeToggleUI(storedThemePreference);
            this.updateLogo(storedThemePreference);
        }

        // Add click event listener to main toggle (desktop)
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isCurrentlyDark = this.rootElement.classList.contains('dark');
                const newTheme = isCurrentlyDark ? 'light' : 'dark';
                this.applyTheme(newTheme);
            });
        }

        // Add click event listener to menu toggle (mobile/tablet)
        if (this.themeToggleMenu) {
            this.themeToggleMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isCurrentlyDark = this.rootElement.classList.contains('dark');
                const newTheme = isCurrentlyDark ? 'light' : 'dark';
                this.applyTheme(newTheme);
            });
        }
    }

    /**
     * Update theme toggle UI elements
     */
    private updateThemeToggleUI(theme: ThemeChoice): void {
        // Update main toggle (desktop)
        if (this.themeToggle) {
            this.themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            this.themeToggle.setAttribute('data-theme', theme);
        }

        // Update menu toggle (mobile/tablet)
        if (this.themeToggleMenu) {
            this.themeToggleMenu.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            this.themeToggleMenu.setAttribute('data-theme', theme);
        }

        // Update labels
        if (this.themeLabel) {
            this.themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
        if (this.themeLabelMenu) {
            this.themeLabelMenu.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
    }

    /**
     * Update logo images based on theme
     */
    private updateLogo(theme: ThemeChoice): void {
        // Update dashboard logo
        if (this.dashboardLogo) {
            const lightSrc = this.dashboardLogo.dataset.logoLight;
            const darkSrc = this.dashboardLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                this.dashboardLogo.setAttribute('src', nextSrc);
            }
        }

        // Update plan detail logo
        const planDetailLogo = document.getElementById(
            'plan-detail-logo'
        ) as HTMLImageElement | null;
        if (planDetailLogo) {
            const lightSrc = planDetailLogo.dataset.logoLight;
            const darkSrc = planDetailLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                planDetailLogo.setAttribute('src', nextSrc);
            }
        }

        // Update brand logo (start page)
        const brandLogo = document.getElementById('brand-logo') as HTMLImageElement | null;
        if (brandLogo) {
            const lightSrc = brandLogo.dataset.logoLight;
            const darkSrc = brandLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                brandLogo.setAttribute('src', nextSrc);
            }
        }
    }

    /**
     * Apply theme to the document
     */
    private applyTheme(theme: ThemeChoice): void {
        // Force remove first, then add to ensure it works
        this.rootElement.classList.remove('dark');
        if (theme === 'dark') {
            this.rootElement.classList.add('dark');
        }

        // Persist theme preference
        localStorage.setItem('debtLiteTheme', theme);

        // Update UI elements
        this.updateThemeToggleUI(theme);
        this.updateLogo(theme);
    }

    /**
     * Get current theme
     */
    public getCurrentTheme(): ThemeChoice {
        return this.rootElement.classList.contains('dark') ? 'dark' : 'light';
    }

    /**
     * Set theme programmatically
     */
    public setTheme(theme: ThemeChoice): void {
        this.applyTheme(theme);
    }
}

/**
 * Theme Toggle Component
 * Manages dark/light theme switching and persistence
 */

export type ThemeChoice = 'light' | 'dark';

export class ThemeToggleComponent {
    private themeToggle: HTMLButtonElement | null;
    private themeLabel: HTMLElement | null;
    private dashboardLogo: HTMLImageElement | null;
    private rootElement: HTMLElement;

    constructor() {
        this.themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement | null;
        this.themeLabel = document.getElementById('theme-toggle-label');
        this.dashboardLogo = document.getElementById('dashboard-logo') as HTMLImageElement | null;
        this.rootElement = document.documentElement;
    }

    /**
     * Initialize theme toggle component
     * Loads saved theme preference and sets up event listeners
     */
    public init(): void {
        if (!this.themeToggle) {
            console.warn('Theme toggle button not found');
            return;
        }

        // Get stored preference or default to light
        const storedThemePreference: ThemeChoice = 
            localStorage.getItem('debtLiteTheme') === 'dark' ? 'dark' : 'light';
        
        console.log('Stored theme preference:', storedThemePreference);
        this.applyTheme(storedThemePreference);

        // Add click event listener
        this.themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCurrentlyDark = this.rootElement.classList.contains('dark');
            const newTheme = isCurrentlyDark ? 'light' : 'dark';
            console.log('Theme toggle clicked. Current:', isCurrentlyDark ? 'dark' : 'light', '-> New:', newTheme);
            this.applyTheme(newTheme);
        });
    }

    /**
     * Update theme toggle UI elements
     */
    private updateThemeToggleUI(theme: ThemeChoice): void {
        if (!this.themeToggle) return;
        
        this.themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        this.themeToggle.setAttribute('data-theme', theme);
        
        if (this.themeLabel) {
            this.themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
        }
    }

    /**
     * Update logo images based on theme
     */
    private updateLogo(theme: ThemeChoice): void {
        // Update overview logo
        if (this.dashboardLogo) {
            const lightSrc = this.dashboardLogo.dataset.logoLight;
            const darkSrc = this.dashboardLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                this.dashboardLogo.setAttribute('src', nextSrc);
            }
        }
        
        // Update plan detail logo
        const planDetailLogo = document.getElementById('plan-detail-logo') as HTMLImageElement | null;
        if (planDetailLogo) {
            const lightSrc = planDetailLogo.dataset.logoLight;
            const darkSrc = planDetailLogo.dataset.logoDark;
            const nextSrc = theme === 'dark' ? darkSrc : lightSrc;
            if (nextSrc) {
                planDetailLogo.setAttribute('src', nextSrc);
            }
        }
    }

    /**
     * Apply theme to the document
     */
    private applyTheme(theme: ThemeChoice): void {
        console.log('Applying theme:', theme);
        
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
        
        console.log('Theme applied. Dark class present:', this.rootElement.classList.contains('dark'));
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


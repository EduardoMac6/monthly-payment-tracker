/**
 * Reusable Side Menu Component
 * Handles the side panel menu functionality (open/close)
 * Can be used in any page that includes the menu HTML structure
 */
(function() {
    'use strict';

    function initializeMenu() {
        // Get DOM elements
        const menuToggle = document.getElementById('menu-toggle');
        const menuClose = document.getElementById('menu-close');
        const sidePanel = document.getElementById('side-panel');
        const panelOverlay = document.getElementById('panel-overlay');

        if (!sidePanel || !panelOverlay || !menuToggle) {
            console.warn('Menu elements not found. Menu component will not initialize.');
            return;
        }

        // Function to set panel state
        function setPanelState(isOpen) {
            sidePanel.classList.toggle('-translate-x-full', !isOpen);
            panelOverlay.classList.toggle('opacity-0', !isOpen);
            panelOverlay.classList.toggle('opacity-100', isOpen);
            panelOverlay.classList.toggle('pointer-events-none', !isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }

        // Event listeners
        menuToggle.addEventListener('click', function() {
            const isCurrentlyOpen = !sidePanel.classList.contains('-translate-x-full');
            setPanelState(!isCurrentlyOpen);
        });

        if (menuClose) {
            menuClose.addEventListener('click', function() {
                setPanelState(false);
            });
        }

        panelOverlay.addEventListener('click', function() {
            setPanelState(false);
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                setPanelState(false);
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
    } else {
        initializeMenu();
    }
})();


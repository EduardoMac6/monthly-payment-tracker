/**
 * Connection Status Component
 * Displays the current connection status (online/offline/checking)
 */

import type { ConnectionStatus } from '../../services/sync/sync.service.js';
import { SyncService } from '../../services/sync/sync.service.js';
import { StorageFactory } from '../../services/storage/storage.factory.js';
import { getEnvStorageType } from '../../config/env.config.js';

/**
 * Connection Status Component
 * Shows visual indicator of connection status
 */
export class ConnectionStatusComponent {
    private container: HTMLElement | null = null;
    private syncService: SyncService | null = null;
    private statusListener: ((status: ConnectionStatus) => void) | null = null;

    /**
     * Initialize the component
     * @param containerId - ID of the container element where the component will be rendered
     */
    init(containerId?: string): void {
        // Only show connection status if using API storage
        if (getEnvStorageType() !== 'api') {
            return;
        }

        // Find or create container
        if (containerId) {
            this.container = document.getElementById(containerId);
        }

        if (!this.container) {
            // Create container if not found
            this.container = document.createElement('div');
            this.container.id = 'connection-status-container';
            this.container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-40';

            // Insert after menu toggle or at the beginning of body
            const menuToggle = document.getElementById('menu-toggle');
            if (menuToggle && menuToggle.parentElement) {
                menuToggle.parentElement.insertBefore(this.container, menuToggle.nextSibling);
            } else {
                document.body.insertBefore(this.container, document.body.firstChild);
            }
        }

        // Initialize sync service
        try {
            const storage = StorageFactory.create();
            this.syncService = new SyncService(storage);
        } catch (error) {
            console.error('Failed to initialize SyncService:', error);
            return;
        }

        // Set up status listener
        this.statusListener = (status: ConnectionStatus) => {
            this.updateStatus(status);
        };
        this.syncService.addStatusListener(this.statusListener);

        // Initial render
        const initialStatus = this.syncService.getConnectionStatus();
        this.updateStatus(initialStatus);

        // Auto-sync when online
        if (this.syncService.isCurrentlyOnline()) {
            this.syncService.syncQueue().catch((error) => {
                console.error('Failed to sync queue on init:', error);
            });
        }
    }

    /**
     * Update the status display
     */
    private updateStatus(status: ConnectionStatus): void {
        if (!this.container) {
            return;
        }

        const { icon, text, bgColor, textColor } = this.getStatusConfig(status);

        this.container.innerHTML = `
            <div class="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg ${bgColor} ${textColor} text-sm font-medium transition-all duration-300">
                <span class="flex-shrink-0">${icon}</span>
                <span class="flex-shrink-0">${text}</span>
                ${
                    this.syncService && this.syncService.getQueueSize() > 0
                        ? `<span class="flex-shrink-0 text-xs opacity-75">(${this.syncService.getQueueSize()} pendiente${this.syncService.getQueueSize() > 1 ? 's' : ''})</span>`
                        : ''
                }
            </div>
        `;
    }

    /**
     * Get status configuration
     */
    private getStatusConfig(status: ConnectionStatus): {
        icon: string;
        text: string;
        bgColor: string;
        textColor: string;
    } {
        switch (status) {
            case 'online':
                return {
                    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
                    text: 'En línea',
                    bgColor: 'bg-lime-vibrant/90 dark:bg-lime-vibrant/80',
                    textColor: 'text-deep-black dark:text-deep-black',
                };
            case 'offline':
                return {
                    icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path></svg>',
                    text: 'Sin conexión',
                    bgColor: 'bg-red-500/90 dark:bg-red-600/90',
                    textColor: 'text-pure-white dark:text-pure-white',
                };
            case 'checking':
                return {
                    icon: '<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>',
                    text: 'Sincronizando...',
                    bgColor: 'bg-yellow-500/90 dark:bg-yellow-600/90',
                    textColor: 'text-deep-black dark:text-pure-white',
                };
            default:
                return {
                    icon: '',
                    text: 'Desconocido',
                    bgColor: 'bg-gray-500/90',
                    textColor: 'text-pure-white',
                };
        }
    }

    /**
     * Cleanup and remove listeners
     */
    destroy(): void {
        if (this.syncService && this.statusListener) {
            this.syncService.removeStatusListener(this.statusListener);
        }
        if (this.container) {
            this.container.remove();
        }
        this.container = null;
        this.syncService = null;
        this.statusListener = null;
    }
}

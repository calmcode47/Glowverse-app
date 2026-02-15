/**
 * Network Monitor Service
 * 
 * Monitors network status and connectivity quality.
 * Triggers sync when network is restored.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

export type NetworkStatus = {
    isOnline: boolean;
    isInternetReachable: boolean | null;
    connectionType: string;
    isWifi: boolean;
    isCellular: boolean;
    isFastConnection: boolean;
};

type NetworkListener = (status: NetworkStatus) => void;

class NetworkMonitorService {
    private listeners: Set<NetworkListener> = new Set();
    private currentStatus: NetworkStatus = {
        isOnline: true,
        isInternetReachable: null,
        connectionType: 'unknown',
        isWifi: false,
        isCellular: false,
        isFastConnection: true,
    };
    private unsubscribeNetInfo?: () => void;
    private appStateSubscription?: any;

    /**
     * Start monitoring network status
     */
    start(): void {
        // Monitor network changes
        this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            this.handleNetInfoChange(state);
        });

        // Monitor app state changes (foreground/background)
        this.appStateSubscription = AppState.addEventListener(
            'change',
            this.handleAppStateChange
        );

        // Get initial state
        NetInfo.fetch().then((state) => {
            this.handleNetInfoChange(state);
        });

        console.log('[NetworkMonitor] Started');
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        this.unsubscribeNetInfo?.();
        this.appStateSubscription?.remove();
        this.listeners.clear();

        console.log('[NetworkMonitor] Stopped');
    }

    /**
     * Handle network info change
     */
    private handleNetInfoChange = (state: NetInfoState): void => {
        const previousOnlineStatus = this.currentStatus.isOnline;

        this.currentStatus = {
            isOnline: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            connectionType: state.type,
            isWifi: state.type === 'wifi',
            isCellular: state.type === 'cellular',
            isFastConnection: this.checkIsFastConnection(state),
        };

        // Log status change
        if (previousOnlineStatus !== this.currentStatus.isOnline) {
            console.log(
                `[NetworkMonitor] Status changed: ${previousOnlineStatus ? 'online' : 'offline'} → ${this.currentStatus.isOnline ? 'online' : 'offline'}`
            );
        }

        // Notify listeners
        this.notifyListeners();
    };

    /**
     * Handle app state change (foreground/background)
     */
    private handleAppStateChange = (nextAppState: AppStateStatus): void => {
        if (nextAppState === 'active') {
            // App came to foreground - recheck network status
            NetInfo.fetch().then((state) => {
                this.handleNetInfoChange(state);
            });
        }
    };

    /**
     * Check if connection is fast enough for background sync
     */
    private checkIsFastConnection(state: NetInfoState): boolean {
        // WiFi is always considered fast
        if (state.type === 'wifi') {
            return true;
        }

        // Check cellular connection quality
        if (state.type === 'cellular' && state.details) {
            const cellularGeneration = (state.details as any).cellularGeneration;
            // 4G, 5G are fast, 2G/3G are slow
            return cellularGeneration === '4g' || cellularGeneration === '5g';
        }

        // Ethernet is fast
        if (state.type === 'ethernet') {
            return true;
        }

        // Unknown or other connections - assume slow
        return false;
    }

    /**
     * Notify all listeners
     */
    private notifyListeners(): void {
        this.listeners.forEach((listener) => {
            try {
                listener(this.currentStatus);
            } catch (error) {
                console.error('[NetworkMonitor] Listener error:', error);
            }
        });
    }

    /**
     * Add network status listener
     */
    addListener(listener: NetworkListener): () => void {
        this.listeners.add(listener);

        // Immediately call with current status
        listener(this.currentStatus);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Get current network status
     */
    getStatus(): NetworkStatus {
        return { ...this.currentStatus };
    }

    /**
     * Check if currently online
     */
    isOnline(): boolean {
        return this.currentStatus.isOnline;
    }

    /**
     * Check if connection is fast
     */
    isFastConnection(): boolean {
        return this.currentStatus.isFastConnection;
    }

    /**
     * Check if on WiFi
     */
    isWifi(): boolean {
        return this.currentStatus.isWifi;
    }

    /**
     * Check if on cellular
     */
    isCellular(): boolean {
        return this.currentStatus.isCellular;
    }

    /**
     * Wait for network to come online
     * @param timeoutMs Timeout in milliseconds (default: 30 seconds)
     */
    waitForOnline(timeoutMs: number = 30000): Promise<boolean> {
        return new Promise((resolve) => {
            // Already online
            if (this.isOnline()) {
                resolve(true);
                return;
            }

            const timeout = setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, timeoutMs);

            const unsubscribe = this.addListener((status) => {
                if (status.isOnline) {
                    clearTimeout(timeout);
                    unsubscribe();
                    resolve(true);
                }
            });
        });
    }
}

/**
 * Singleton instance
 */
export const networkMonitor = new NetworkMonitorService();

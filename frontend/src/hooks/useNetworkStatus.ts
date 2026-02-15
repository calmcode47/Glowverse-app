/**
 * React Hook for Network Status
 * 
 * Custom hook to access network status in React components.
 */

import { useEffect, useState } from 'react';
import { networkMonitor, NetworkStatus } from '../services/sync/NetworkMonitor';

/**
 * Hook to get current network status
 * Re-renders component when network status changes
 */
export function useNetworkStatus(): NetworkStatus {
    const [status, setStatus] = useState<NetworkStatus>(networkMonitor.getStatus());

    useEffect(() => {
        const unsubscribe = networkMonitor.addListener((newStatus) => {
            setStatus(newStatus);
        });

        return unsubscribe;
    }, []);

    return status;
}

/**
 * Hook to get online status (boolean)
 */
export function useIsOnline(): boolean {
    const status = useNetworkStatus();
    return status.isOnline;
}

/**
 * Hook to check if connection is fast
 */
export function useIsFastConnection(): boolean {
    const status = useNetworkStatus();
    return status.isFastConnection;
}

/**
 * Hook to check if on WiFi
 */
export function useIsWifi(): boolean {
    const status = useNetworkStatus();
    return status.isWifi;
}

/**
 * Offline Queue Hook
 * 
 * React hook to access offline queue status.
 */

import { useState, useEffect } from 'react';
import { offlineQueue } from '../services/offlineQueue.service';

export interface OfflineQueueStatus {
    pendingCount: number;
    isSyncing: boolean;
}

/**
 * Hook to get offline queue status
 */
export function useOfflineQueue(): OfflineQueueStatus {
    const [status, setStatus] = useState<OfflineQueueStatus>({
        pendingCount: 0,
        isSyncing: false,
    });

    useEffect(() => {
        // Initial load
        updateStatus();

        // Poll for changes every 2 seconds
        const interval = setInterval(updateStatus, 2000);

        return () => clearInterval(interval);
    }, []);

    const updateStatus = async () => {
        try {
            const operations = await offlineQueue.getQueuedOperations();
            setStatus({
                pendingCount: operations.length,
                isSyncing: false, // TODO: Track syncing state in offlineQueue service
            });
        } catch (error) {
            console.error('[useOfflineQueue] Error getting queue status:', error);
        }
    };

    return status;
}

/**
 * Offline Banner Component
 * 
 * Shows a non-intrusive banner when offline or when there are pending sync operations.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

export function OfflineBanner() {
    const networkStatus = useNetworkStatus();
    const { pendingCount, isSyncing } = useOfflineQueue();

    // Don't show anything if online and no pending operations
    if (networkStatus.isOnline && pendingCount === 0) {
        return null;
    }

    // Determine banner message and color
    let message: string;
    let backgroundColor: string;

    if (!networkStatus.isOnline) {
        message = 'You\'re offline. Changes will sync when online.';
        backgroundColor = '#FF9500'; // Orange
    } else if (isSyncing) {
        message = `Syncing ${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'}...`;
        backgroundColor = '#007AFF'; // Blue
    } else if (pendingCount > 0) {
        message = `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} pending sync`;
        backgroundColor = '#34C759'; // Green
    } else {
        return null;
    }

    return (
        <View style={[styles.banner, { backgroundColor }]}>
            <View style={styles.content}>
                <Text style={styles.text}>{message}</Text>
                {isSyncing && (
                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        zIndex: 1000,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    spinner: {
        marginLeft: 8,
    },
});

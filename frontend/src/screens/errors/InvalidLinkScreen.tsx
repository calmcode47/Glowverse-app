/**
 * Invalid Link Screen
 * 
 * Displayed when a deep link is invalid, expired, or cannot be processed.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type InvalidLinkScreenRouteProp = RouteProp<{
    InvalidLink: { error?: string };
}, 'InvalidLink'>;

export default function InvalidLinkScreen() {
    const navigation = useNavigation();
    const route = useRoute<InvalidLinkScreenRouteProp>();
    const error = route.params?.error || 'This link is invalid or has expired';

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
            </View>

            <Text style={styles.title}>Invalid Link</Text>
            <Text style={styles.message}>{error}</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Home' as never)}
                >
                    <Text style={styles.primaryButtonText}>Go to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Shop' as never)}
                >
                    <Text style={styles.secondaryButtonText}>Browse Products</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.supportLink}
                onPress={() => {
                    // Navigate to support or open email
                    console.log('Contact support');
                }}
            >
                <Text style={styles.supportText}>Contact Support</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#1A1A1A',
        fontSize: 16,
        fontWeight: '600',
    },
    supportLink: {
        marginTop: 24,
    },
    supportText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '500',
    },
});

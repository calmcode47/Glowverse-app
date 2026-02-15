/**
 * Link Expired Screen
 * 
 * Displayed when a deep link has expired (e.g., referral codes, reset tokens).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

type LinkExpiredScreenRouteProp = RouteProp<{
    LinkExpired: {
        type?: 'referral' | 'reset' | 'other';
        message?: string;
    };
}, 'LinkExpired'>;

export default function LinkExpiredScreen() {
    const navigation = useNavigation();
    const route = useRoute<LinkExpiredScreenRouteProp>();
    const { type = 'other', message } = route.params || {};

    const [email, setEmail] = useState('');

    const getTitle = () => {
        switch (type) {
            case 'referral':
                return 'Referral Code Expired';
            case 'reset':
                return 'Reset Link Expired';
            default:
                return 'Link Expired';
        }
    };

    const getMessage = () => {
        if (message) return message;

        switch (type) {
            case 'referral':
                return 'This referral code has expired or has reached its usage limit.';
            case 'reset':
                return 'This password reset link has expired. Please request a new one.';
            default:
                return 'This link has expired or is no longer valid.';
        }
    };

    const handlePrimaryAction = () => {
        switch (type) {
            case 'reset':
                // Navigate to forgot password
                navigation.navigate('ForgotPassword' as never);
                break;
            case 'referral':
                // Browse products
                navigation.navigate('Shop' as never);
                break;
            default:
                navigation.navigate('Home' as never);
        }
    };

    const getPrimaryButtonText = () => {
        switch (type) {
            case 'reset':
                return 'Request New Link';
            case 'referral':
                return 'Browse Products';
            default:
                return 'Go to Home';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={80} color="#F59E0B" />
            </View>

            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.message}>{getMessage()}</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handlePrimaryAction}
                >
                    <Text style={styles.primaryButtonText}>{getPrimaryButtonText()}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Home' as never)}
                >
                    <Text style={styles.secondaryButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.helpContainer}>
                <Text style={styles.helpText}>Need help?</Text>
                <TouchableOpacity
                    onPress={() => {
                        // Navigate to support
                        console.log('Navigate to support');
                    }}
                >
                    <Text style={styles.supportText}>Contact Support</Text>
                </TouchableOpacity>
            </View>
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
    helpContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    helpText: {
        color: '#666666',
        fontSize: 14,
        marginBottom: 8,
    },
    supportText: {
        color: '#8B5CF6',
        fontSize: 14,
        fontWeight: '500',
    },
});

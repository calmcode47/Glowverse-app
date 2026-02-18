import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { verifyResetToken, resetPassword } from '../../services/api/auth.api';

interface ResetPasswordScreenProps {
    route: any;
    navigation: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ route, navigation }) => {
    const { token } = route.params || {};
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        if (!token) {
            setVerifying(false);
            setTokenValid(false);
            return;
        }

        (async () => {
            try {
                const result = await verifyResetToken(token);
                setTokenValid(result.success);
            } catch {
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        })();
    }, [token]);

    const handleSubmit = async () => {
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, password);
            Alert.alert(
                'Success',
                'Your password has been reset successfully. You can now log in with your new password.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error: any) {
            const message = error?.response?.data?.error?.message || 'Failed to reset password. The link may have expired.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Verifying reset link...</Text>
            </View>
        );
    }

    if (!tokenValid) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text variant="headlineMedium" style={styles.title}>
                    Invalid Link
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    This password reset link is invalid or has expired. Please request a new one.
                </Text>
                <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.button}>
                    Back to Login
                </Button>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text variant="headlineMedium" style={styles.title}>
                    Create New Password
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Enter your new password below. It must be at least 8 characters with uppercase, lowercase, and a number.
                </Text>

                <TextInput
                    label="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    style={styles.input}
                    mode="outlined"
                    disabled={loading}
                />

                <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    style={styles.input}
                    mode="outlined"
                    disabled={loading}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading || !password || !confirmPassword}
                    style={styles.button}
                >
                    Reset Password
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    center: {
        alignItems: 'center',
    },
    title: {
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: 30,
        textAlign: 'center',
        opacity: 0.7,
    },
    input: {
        marginBottom: 20,
    },
    button: {
        marginBottom: 15,
    },
    loadingText: {
        marginTop: 16,
        opacity: 0.6,
    },
});

export default ResetPasswordScreen;

import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { requestPasswordReset } from '../../services/api/auth.api';

interface ForgotPasswordScreenProps {
    navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            await requestPasswordReset(trimmed);
            setSent(true);
        } catch {
            // Still show success to prevent email enumeration
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={styles.container}>
                <Text variant="headlineMedium" style={styles.title}>
                    Check Your Email
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    If an account exists with that email, we've sent a password reset link. Please check your inbox and spam folder.
                </Text>
                <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
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
                    Reset Password
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    style={styles.input}
                    mode="outlined"
                    disabled={loading}
                />

                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading || !email.trim()}
                    style={styles.button}
                >
                    Send Reset Link
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    Back to Login
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
});

export default ForgotPasswordScreen;

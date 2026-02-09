import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

type LoginScreenProps = {
    navigation: StackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { theme, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const buttonScale = useSharedValue(1);
    const emailBorderColor = useSharedValue(0);
    const passwordBorderColor = useSharedValue(0);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const emailBorderStyle = useAnimatedStyle(() => ({
        borderColor: emailBorderColor.value === 1
            ? theme.colors.accent.emerald
            : theme.colors.border.light,
    }));

    const passwordBorderStyle = useAnimatedStyle(() => ({
        borderColor: passwordBorderColor.value === 1
            ? theme.colors.accent.emerald
            : theme.colors.border.light,
    }));

    const handleLogin = async () => {
        // Animate button
        buttonScale.value = withSequence(
            withSpring(0.95, { damping: 10 }),
            withSpring(1, { damping: 10 })
        );

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigation.replace('MainTabs');
        }, 1500);
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
    };

    const handleEmailFocus = () => {
        setEmailFocused(true);
        emailBorderColor.value = withTiming(1, { duration: 300 });
    };

    const handleEmailBlur = () => {
        setEmailFocused(false);
        emailBorderColor.value = withTiming(0, { duration: 300 });
    };

    const handlePasswordFocus = () => {
        setPasswordFocused(true);
        passwordBorderColor.value = withTiming(1, { duration: 300 });
    };

    const handlePasswordBlur = () => {
        setPasswordFocused(false);
        passwordBorderColor.value = withTiming(0, { duration: 300 });
    };

    const styles = createStyles(theme, isDark);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ProfessionalBackground variant="subtle" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <ScrollReveal delay={0} scale springy>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={styles.logoGradient}
                            >
                                <MaterialCommunityIcons
                                    name="crown-outline"
                                    size={40}
                                    color={theme.colors.text.inverse}
                                />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                    </View>
                </ScrollReveal>

                {/* Form */}
                <ScrollReveal delay={200} direction="up">
                    <View style={styles.form}>
                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <Animated.View style={[styles.inputWrapper, emailBorderStyle]}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@email.com"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    onFocus={handleEmailFocus}
                                    onBlur={handleEmailBlur}
                                />
                            </Animated.View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <Animated.View style={[styles.inputWrapper, passwordBorderStyle]}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    onFocus={handlePasswordFocus}
                                    onBlur={handlePasswordBlur}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialCommunityIcons
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={theme.colors.text.tertiary}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <Animated.View style={buttonAnimatedStyle}>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={theme.colors.gradients.primary}
                                style={styles.loginButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                >
                                {isLoading ? (
                                    <MaterialCommunityIcons
                                        name="loading"
                                        size={24}
                                        color={theme.colors.text.inverse}
                                    />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollReveal>

            {/* Divider */}
            <ScrollReveal delay={400} direction="up">
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                </View>
            </ScrollReveal>

            {/* Social Login */}
            <ScrollReveal delay={500} direction="up">
                <View style={styles.socialContainer}>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Google')}
                    >
                        <MaterialCommunityIcons
                            name="google"
                            size={24}
                            color={theme.colors.text.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Apple')}
                    >
                        <MaterialCommunityIcons
                            name="apple"
                            size={24}
                            color={theme.colors.text.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={() => handleSocialLogin('Facebook')}
                    >
                        <MaterialCommunityIcons
                            name="facebook"
                            size={24}
                            color={theme.colors.text.primary}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollReveal>

            {/* Sign Up Link */}
            <ScrollReveal delay={600} direction="up">
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollReveal>
        </ScrollView >
        </KeyboardAvoidingView >
    );
}

const createStyles = (theme: any, isDark: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background.primary,
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: theme.spacing['2xl'],
        },
        content: {
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
        },
        header: {
            alignItems: 'center',
            marginBottom: theme.spacing['3xl'],
        },
        logoContainer: {
            marginBottom: theme.spacing.lg,
        },
        logoGradient: {
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.lg,
        },
        title: {
            fontSize: theme.typography.sizes['3xl'],
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
        },
        subtitle: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
        },
        form: {
            marginBottom: theme.spacing.xl,
        },
        inputContainer: {
            marginBottom: theme.spacing.lg,
        },
        label: {
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
        },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            paddingHorizontal: theme.spacing.base,
        },
        inputIcon: {
            marginRight: theme.spacing.sm,
        },
        input: {
            flex: 1,
            height: 50,
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.primary,
        },
        eyeIcon: {
            padding: theme.spacing.sm,
        },
        forgotPassword: {
            alignSelf: 'flex-end',
            marginBottom: theme.spacing.xl,
        },
        forgotPasswordText: {
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.accent.emerald,
            fontWeight: theme.typography.weights.medium,
        },
        loginButton: {
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            ...theme.shadows.md,
        },
        loginButtonGradient: {
            height: 54,
            alignItems: 'center',
            justifyContent: 'center',
        },
        loginButtonText: {
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.inverse,
        },
        divider: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: theme.spacing.xl,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: theme.colors.border.light,
        },
        dividerText: {
            marginHorizontal: theme.spacing.base,
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.tertiary,
        },
        socialContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.base,
        },
        socialButton: {
            width: 56,
            height: 56,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.background.elevated,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadows.sm,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: theme.spacing.xl,
        },
        footerText: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.text.secondary,
        },
        footerLink: {
            fontSize: theme.typography.sizes.base,
            color: theme.colors.accent.emerald,
            fontWeight: theme.typography.weights.semibold,
        },
    });

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
    withRepeat,
    withSequence,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/themeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import ProfessionalBackground from '../../components/animated/ProfessionalBackground';
import ScrollReveal from '../../components/animations/ScrollReveal';

type SignUpScreenProps = {
    navigation: StackNavigationProp<any>;
};

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
    const { theme, isDark } = useTheme();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const buttonScale = useSharedValue(1);
    const checkboxScale = useSharedValue(1);
    const logoScale = useSharedValue(1);
    const inputScale = useSharedValue(1);

    React.useEffect(() => {
        logoScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const checkboxAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkboxScale.value }],
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
    }));

    const handleSignUp = async () => {
        if (!agreedToTerms) {
            alert('Please agree to Terms & Conditions');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        buttonScale.value = withSequence(
            withSpring(0.95, { damping: 10 }),
            withSpring(1, { damping: 10 })
        );

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigation.replace('MainTabs');
        }, 1500);
    };

    const handleSocialSignUp = (provider: string) => {
        console.log(`Sign up with ${provider}`);
    };

    const toggleTerms = () => {
        const newValue = !agreedToTerms;
        setAgreedToTerms(newValue);
        if (newValue) {
            checkboxScale.value = withSequence(
                withSpring(1.2, { damping: 5 }),
                withSpring(1, { damping: 10 })
            );
        }
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
                <ScrollReveal delay={0} scale springy>
                    <View style={styles.header}>
                        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                            <LinearGradient
                                colors={theme.colors.gradients.primary}
                                style={styles.logoGradient}
                            >
                                <MaterialCommunityIcons
                                    name="account-plus-outline"
                                    size={40}
                                    color={theme.colors.text.inverse}
                                />
                            </LinearGradient>
                        </Animated.View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and elevate your style</Text>
                    </View>
                </ScrollReveal>

                <ScrollReveal delay={200} direction="up">
                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="John Doe"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
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
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="password-new"
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
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons
                                    name="lock-check-outline"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialCommunityIcons
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color={theme.colors.text.tertiary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms & Conditions */}
                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={toggleTerms}
                        >
                            <Animated.View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked, checkboxAnimatedStyle]}>
                                {agreedToTerms && (
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={16}
                                        color={theme.colors.text.inverse}
                                    />
                                )}
                            </Animated.View>
                            <Text style={styles.termsText}>
                                I agree to the{' '}
                                <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Sign Up Button */}
                        < Animated.View style={buttonAnimatedStyle}>
                            <TouchableOpacity
                                style={styles.signUpButton}
                                onPress={handleSignUp}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={theme.colors.gradients.primary}
                                    style={styles.signUpButtonGradient}
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
                                        <Text style={styles.signUpButtonText}>Create Account</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </ScrollReveal>

                <ScrollReveal delay={400} direction="up">
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or sign up with</Text>
                        <View style={styles.dividerLine} />
                    </View>
                </ScrollReveal>

                <ScrollReveal delay={500} direction="up">
                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialSignUp('Google')}
                        >
                            <MaterialCommunityIcons
                                name="google"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialSignUp('Apple')}
                        >
                            <MaterialCommunityIcons
                                name="apple"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => handleSocialSignUp('Facebook')}
                        >
                            <MaterialCommunityIcons
                                name="facebook"
                                size={24}
                                color={theme.colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>

                <ScrollReveal delay={600} direction="up">
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollReveal>
            </ScrollView>
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
            paddingTop: theme.spacing['3xl'],
            paddingBottom: theme.spacing['3xl'],
        },
        content: {
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
        },
        header: {
            alignItems: 'center',
            marginBottom: theme.spacing['2xl'],
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
            marginBottom: theme.spacing.base,
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
        termsContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginVertical: theme.spacing.lg,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: theme.colors.border.DEFAULT,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing.sm,
            marginTop: 2,
        },
        checkboxChecked: {
            backgroundColor: theme.colors.accent.emerald,
            borderColor: theme.colors.accent.emerald,
        },
        termsText: {
            flex: 1,
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text.secondary,
            lineHeight: 20,
        },
        termsLink: {
            color: theme.colors.accent.emerald,
            fontWeight: theme.typography.weights.medium,
        },
        signUpButton: {
            borderRadius: theme.radius.md,
            overflow: 'hidden',
            ...theme.shadows.md,
        },
        signUpButtonGradient: {
            height: 54,
            alignItems: 'center',
            justifyContent: 'center',
        },
        signUpButtonText: {
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

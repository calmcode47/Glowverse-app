import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useTheme } from "../../theme/themeContext";
import { useAuth } from "../../context/AuthContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ScrollReveal from "../../components/animations/ScrollReveal";

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameBorder = useSharedValue(0);
  const emailBorder = useSharedValue(0);
  const passwordBorder = useSharedValue(0);
  const confirmBorder = useSharedValue(0);
  const nameScale = useSharedValue(1);
  const emailScale = useSharedValue(1);
  const passwordScale = useSharedValue(1);
  const confirmScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [glow]);

  const nameBorderStyle = useAnimatedStyle(() => ({
    borderColor: nameBorder.value ? theme.colors.accent.emerald : theme.colors.border.light,
    transform: [{ scale: nameScale.value }],
  }));
  const emailBorderStyle = useAnimatedStyle(() => ({
    borderColor: emailBorder.value ? theme.colors.accent.emerald : theme.colors.border.light,
    transform: [{ scale: emailScale.value }],
  }));
  const passwordBorderStyle = useAnimatedStyle(() => ({
    borderColor: passwordBorder.value ? theme.colors.accent.emerald : theme.colors.border.light,
    transform: [{ scale: passwordScale.value }],
  }));
  const confirmBorderStyle = useAnimatedStyle(() => ({
    borderColor: confirmBorder.value ? theme.colors.accent.emerald : theme.colors.border.light,
    transform: [{ scale: confirmScale.value }],
  }));
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolateClamp(glow.value, 0.12, 0.22),
  }));

  const setFocus = (which: "name" | "email" | "password" | "confirm", focused: boolean) => {
    const v = focused ? 1 : 0;
    const border = which === "name" ? nameBorder : which === "email" ? emailBorder : which === "password" ? passwordBorder : confirmBorder;
    const scale = which === "name" ? nameScale : which === "email" ? emailScale : which === "password" ? passwordScale : confirmScale;
    border.value = withTiming(v, { duration: 180 });
    scale.value = withSpring(focused ? 1.02 : 1, { damping: 14 });
  };

  const validate = (): string | null => {
    const nameOk = name.trim().length >= 2;
    const emailOk = /.+@.+\..+/.test(email.trim());
    const passOk = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    const confirmOk = confirmPassword === password && confirmPassword.length > 0;
    if (!nameOk) return "Enter your full name";
    if (!emailOk) return "Enter a valid email address";
    if (!passOk) return "Use 8+ chars with upper, lower and number";
    if (!confirmOk) return "Passwords do not match";
    if (!agreed) return "Please accept Terms & Conditions";
    return null;
  };

  const submit = async () => {
    buttonScale.value = withSequence(withSpring(0.97, { damping: 12 }), withSpring(1, { damping: 12 }));
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await register({ email: email.trim(), password, name: name.trim() });
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" as any }] });
    } catch (e: any) {
      const status = e?.response?.status;
      let msg = "Sign up failed. Please try again.";
      if (status === 409) msg = "An account with this email already exists";
      else if (status === 429) msg = "Too many attempts. Please try again later.";
      else if (e?.response?.data?.message) msg = String(e.response.data.message);
      else if (e?.message?.includes?.("Network Error")) msg = "Cannot reach server. Check your connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme, isDark);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ProfessionalBackground variant="subtle" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollReveal delay={0} scale springy>
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer]}>
              <LinearGradient colors={theme.colors.gradients.primary} style={styles.logoGradient}>
                <MaterialCommunityIcons name="account-plus-outline" size={40} color={theme.colors.text.inverse} />
              </LinearGradient>
              <Animated.View pointerEvents="none" style={[styles.logoGlow, glowStyle]} />
            </Animated.View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Glowverse and elevate your style</Text>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={200} direction="up">
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Animated.View style={[styles.inputWrapper, nameBorderStyle]}>
                <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={name}
                  onChangeText={(t) => { setName(t); if (error) setError(null); }}
                  autoCapitalize="words"
                  autoComplete="name"
                  onFocus={() => setFocus("name", true)}
                  onBlur={() => setFocus("name", false)}
                  editable={!loading}
                />
              </Animated.View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Animated.View style={[styles.inputWrapper, emailBorderStyle]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (error) setError(null); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onFocus={() => setFocus("email", true)}
                  onBlur={() => setFocus("email", false)}
                  editable={!loading}
                />
              </Animated.View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <Animated.View style={[styles.inputWrapper, passwordBorderStyle]}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (error) setError(null); }}
                  secureTextEntry
                  autoCapitalize="none"
                  onFocus={() => setFocus("password", true)}
                  onBlur={() => setFocus("password", false)}
                  editable={!loading}
                />
              </Animated.View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <Animated.View style={[styles.inputWrapper, confirmBorderStyle]}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); if (error) setError(null); }}
                  secureTextEntry
                  autoCapitalize="none"
                  onFocus={() => setFocus("confirm", true)}
                  onBlur={() => setFocus("confirm", false)}
                  editable={!loading}
                />
              </Animated.View>
            </View>

            <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed((v) => !v)} activeOpacity={0.85} disabled={loading}>
              <View style={[styles.checkbox, agreed && { backgroundColor: theme.colors.accent.emerald, borderColor: theme.colors.accent.emerald }]}>
                {agreed ? <MaterialCommunityIcons name="check" size={16} color={theme.colors.text.inverse} /> : null}
              </View>
              <Text style={styles.termsText}>I agree to Terms & Conditions</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.75 }]} onPress={submit} activeOpacity={0.9} disabled={loading}>
                <LinearGradient colors={theme.colors.gradients.primary} style={styles.primaryButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {loading ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={520} direction="up">
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollReveal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function interpolateClamp(v: number, min: number, max: number) {
  "worklet";
  return min + (max - min) * v;
}

function createStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 36,
      paddingBottom: 40,
    },
    header: {
      alignItems: "center",
      marginBottom: 22,
    },
    logoContainer: {
      width: 86,
      height: 86,
      borderRadius: 24,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    logoGradient: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    logoGlow: {
      position: "absolute",
      left: -26,
      right: -26,
      top: -26,
      bottom: -26,
      backgroundColor: theme.colors.accent.emerald,
      borderRadius: 999,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text.primary,
      letterSpacing: -0.3,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
    form: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      padding: 18,
    },
    inputContainer: {
      marginBottom: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.text.secondary,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      borderRadius: 14,
      backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.primary,
      paddingHorizontal: 12,
      height: 52,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: theme.colors.text.primary,
      fontSize: 15,
      fontWeight: "600",
    },
    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 4,
      marginBottom: 6,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    termsText: {
      color: theme.colors.text.secondary,
      fontSize: 13,
      fontWeight: "700",
    },
    errorBox: {
      marginTop: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.error + "55",
      backgroundColor: theme.colors.error + "10",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    errorText: {
      flex: 1,
      color: theme.colors.error,
      fontSize: 13,
      fontWeight: "700",
    },
    primaryButton: {
      marginTop: 14,
      borderRadius: 14,
      overflow: "hidden",
    },
    primaryButtonGradient: {
      height: 54,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: theme.colors.text.inverse,
      fontSize: 16,
      fontWeight: "800",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
    },
    footerText: {
      color: theme.colors.text.secondary,
      fontSize: 14,
      fontWeight: "600",
    },
    footerLink: {
      color: theme.colors.accent.emerald,
      fontSize: 14,
      fontWeight: "800",
    },
  });
}

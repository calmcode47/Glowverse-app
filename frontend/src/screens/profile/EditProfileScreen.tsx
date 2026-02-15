import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "../../theme/themeContext";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as UserAPI from "../../services/api/user.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ScrollReveal from "../../components/animations/ScrollReveal";

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const navigation = useNavigation<any>();
  const { user, updateUser: updateAuthUser } = useAuth() as any;

  const [name, setName] = useState<string>(user?.name || "");
  const [email] = useState<string>(user?.email || "");
  const [avatar, setAvatar] = useState<string | undefined>((user as any)?.avatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const glow = useSharedValue(0);
  React.useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.14 + 0.08 * glow.value }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission required", "Please grant media library access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (res.canceled || !res.assets?.length) return;
    const img = res.assets[0];
    const crop = await ImageManipulator.manipulateAsync(img.uri, [{ resize: { width: 512, height: 512 } }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setAvatar(crop.uri);
    if (error) setError(null);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission required", "Please grant camera access.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (res.canceled || !res.assets?.length) return;
    const img = res.assets[0];
    const crop = await ImageManipulator.manipulateAsync(img.uri, [{ resize: { width: 512, height: 512 } }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG });
    setAvatar(crop.uri);
    if (error) setError(null);
  };

  const save = async () => {
    const cleaned = name.trim();
    if (cleaned.length < 2) {
      setError("Enter your full name");
      return;
    }

    setSaving(true);
    try {
      let nextAvatar = avatar;
      if (user?.id && avatar && !avatar.startsWith("http")) {
        const uploaded = await UserAPI.uploadAvatar({ uri: avatar, type: "image/jpeg", name: "avatar.jpg" });
        nextAvatar = uploaded.avatarUrl;
      }

      if (user?.id) {
        await UserAPI.updateUser(user.id, { name: cleaned, ...(nextAvatar ? { avatar: nextAvatar } : {}) });
        updateAuthUser?.({ name: cleaned, ...(nextAvatar ? { avatar: nextAvatar } : {}) });
      } else {
        await AsyncStorage.setItem("demo_user", JSON.stringify({ name: cleaned, email, avatar: nextAvatar || null, createdAt: new Date().toISOString() }));
      }

      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ProfessionalBackground variant="subtle" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollReveal delay={0} scale springy>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient colors={theme.colors.gradients.primary} style={styles.logoGradient}>
                <MaterialCommunityIcons name="account-edit-outline" size={40} color={theme.colors.text.inverse} />
              </LinearGradient>
              <Animated.View pointerEvents="none" style={[styles.logoGlow, glowStyle]} />
            </View>
            <Text style={styles.title}>Edit Personal Info</Text>
            <Text style={styles.subtitle}>Update your name and profile photo</Text>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={160} direction="up">
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <TouchableOpacity onPress={pickPhoto} activeOpacity={0.9} style={styles.avatarButton} accessibilityRole="button" accessibilityLabel="Choose profile photo">
                {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.colors.background.secondary }]} />}
                <View style={styles.cameraBadge}>
                  <MaterialCommunityIcons name="camera" size={16} color={theme.colors.text.inverse} />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.avatarTitle}>Profile photo</Text>
                <Text style={styles.avatarSubtitle}>Tap photo to choose from gallery</Text>
                <TouchableOpacity onPress={takePhoto} activeOpacity={0.85} style={styles.secondarySmallBtn} accessibilityRole="button" accessibilityLabel="Take profile photo">
                  <MaterialCommunityIcons name="camera-outline" size={18} color={theme.colors.text.primary} />
                  <Text style={styles.secondarySmallText}>Take photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={name}
                  onChangeText={(t) => { setName(t); if (error) setError(null); }}
                  autoCapitalize="words"
                  editable={!saving}
                  accessibilityLabel="Name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, { opacity: 0.75 }]}>
                <MaterialCommunityIcons name="email-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  editable={false}
                  accessibilityLabel="Email (read only)"
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={save} activeOpacity={0.9} disabled={saving} style={[styles.primaryButton, saving && { opacity: 0.75 }]} accessibilityRole="button" accessibilityLabel="Save changes">
              <LinearGradient colors={theme.colors.gradients.primary} style={styles.primaryButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {saving ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollReveal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: any, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 },
    header: { alignItems: "center", marginBottom: 18 },
    logoContainer: { width: 86, height: 86, borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center", marginBottom: 14 },
    logoGradient: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
    logoGlow: { position: "absolute", left: -26, right: -26, top: -26, bottom: -26, backgroundColor: theme.colors.accent.emerald, borderRadius: 999 },
    title: { fontSize: 28, fontWeight: "800", color: theme.colors.text.primary, letterSpacing: -0.3 },
    subtitle: { marginTop: 6, fontSize: 14, color: theme.colors.text.secondary, textAlign: "center" },
    card: { backgroundColor: theme.colors.background.elevated, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border.light, padding: 18 },
    avatarRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
    avatarButton: { width: 88, height: 88, borderRadius: 24, overflow: "hidden" },
    avatar: { width: "100%", height: "100%" },
    cameraBadge: { position: "absolute", right: 8, bottom: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.accent.emerald, alignItems: "center", justifyContent: "center" },
    avatarTitle: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 16 },
    avatarSubtitle: { marginTop: 4, color: theme.colors.text.secondary, fontWeight: "600", fontSize: 13 },
    secondarySmallBtn: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignSelf: "flex-start" },
    secondarySmallText: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 13 },
    inputContainer: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: "700", color: theme.colors.text.secondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 },
    inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: 14, backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.primary, paddingHorizontal: 12, height: 52 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: theme.colors.text.primary, fontSize: 15, fontWeight: "600" },
    errorBox: { marginTop: 2, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.error + "55", backgroundColor: theme.colors.error + "10", flexDirection: "row", alignItems: "center", gap: 10 },
    errorText: { flex: 1, color: theme.colors.error, fontSize: 13, fontWeight: "700" },
    primaryButton: { marginTop: 6, borderRadius: 14, overflow: "hidden" },
    primaryButtonGradient: { height: 54, alignItems: "center", justifyContent: "center" },
    primaryButtonText: { color: theme.colors.text.inverse, fontSize: 16, fontWeight: "800" },
  });
}

import * as React from "react";
import { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Switch, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/themeContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as OrdersAPI from "../../services/api/orders.api";
import { useAuth } from "../../context/AuthContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import ScrollReveal from "../../components/animations/ScrollReveal";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditAddressScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const existing = route.params?.address as OrdersAPI.Address | undefined;
  const [draft, setDraft] = useState({
    fullName: existing?.fullName || "",
    street: existing?.street || "",
    city: existing?.city || "",
    state: existing?.state || "",
    postalCode: existing?.postalCode || "",
    country: existing?.country || "",
    phone: existing?.phone || "",
    isDefault: existing?.isDefault || false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const userId = user?.id || "guest";
    const fullName = draft.fullName.trim();
    const street = draft.street.trim();
    const city = draft.city.trim();
    const state = draft.state.trim();
    const postalCode = draft.postalCode.trim();
    const country = draft.country.trim();

    if (fullName.length < 2) {
      setError("Enter full name");
      return;
    }
    if (!street) {
      setError("Enter street address");
      return;
    }
    if (!city) {
      setError("Enter city");
      return;
    }
    if (!state) {
      setError("Enter state");
      return;
    }
    if (!postalCode) {
      setError("Enter postal code");
      return;
    }
    if (!country) {
      setError("Enter country");
      return;
    }

    setSaving(true);
    try {
      setError(null);
      if (existing) {
        await OrdersAPI.updateUserAddress(userId, existing.id, {
          ...draft,
          fullName,
          street,
          city,
          state,
          postalCode,
          country,
          phone: draft.phone.trim(),
        });
      } else {
        await OrdersAPI.addUserAddress(userId, {
          ...draft,
          fullName,
          street,
          city,
          state,
          postalCode,
          country,
          phone: draft.phone.trim(),
        });
      }
      navigation.goBack();
    } catch (e: any) {
      setError(e?.message || "Could not save address");
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
                <MaterialCommunityIcons name={existing ? "map-marker-outline" : "map-marker-plus-outline"} size={40} color={theme.colors.text.inverse} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{existing ? "Edit Address" : "Add Address"}</Text>
            <Text style={styles.subtitle}>Keep checkout fast with saved addresses</Text>
          </View>
        </ScrollReveal>

        <ScrollReveal delay={160} direction="up">
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={draft.fullName}
                  onChangeText={(t) => { setDraft({ ...draft, fullName: t }); if (error) setError(null); }}
                  editable={!saving}
                  autoCapitalize="words"
                  accessibilityLabel="Full name"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Street</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="home-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Street address"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={draft.street}
                  onChangeText={(t) => { setDraft({ ...draft, street: t }); if (error) setError(null); }}
                  editable={!saving}
                  accessibilityLabel="Street address"
                />
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="city-variant-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={draft.city}
                    onChangeText={(t) => { setDraft({ ...draft, city: t }); if (error) setError(null); }}
                    editable={!saving}
                    accessibilityLabel="City"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>State</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="map-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={draft.state}
                    onChangeText={(t) => { setDraft({ ...draft, state: t }); if (error) setError(null); }}
                    editable={!saving}
                    accessibilityLabel="State"
                  />
                </View>
              </View>
            </View>

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Postal Code</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="mailbox-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Postal code"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={draft.postalCode}
                    onChangeText={(t) => { setDraft({ ...draft, postalCode: t }); if (error) setError(null); }}
                    editable={!saving}
                    accessibilityLabel="Postal code"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Country</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="earth" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Country"
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={draft.country}
                    onChangeText={(t) => { setDraft({ ...draft, country: t }); if (error) setError(null); }}
                    editable={!saving}
                    accessibilityLabel="Country"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={theme.colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={draft.phone}
                  onChangeText={(t) => { setDraft({ ...draft, phone: t }); if (error) setError(null); }}
                  editable={!saving}
                  accessibilityLabel="Phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Default address</Text>
                <Text style={styles.switchSubtitle}>Use this address as your default</Text>
              </View>
              <Switch
                value={draft.isDefault}
                onValueChange={(v) => { setDraft({ ...draft, isDefault: v }); if (error) setError(null); }}
                trackColor={{ false: theme.colors.border.DEFAULT, true: theme.colors.accent.emerald }}
                thumbColor="#fff"
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={theme.colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity onPress={save} activeOpacity={0.9} disabled={saving} style={[styles.primaryButton, saving && { opacity: 0.75 }]} accessibilityRole="button" accessibilityLabel="Save address">
              <LinearGradient colors={theme.colors.gradients.primary} style={styles.primaryButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {saving ? <ActivityIndicator color={theme.colors.text.inverse} /> : <Text style={styles.primaryButtonText}>Save Address</Text>}
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
    title: { fontSize: 28, fontWeight: "800", color: theme.colors.text.primary, letterSpacing: -0.3 },
    subtitle: { marginTop: 6, fontSize: 14, color: theme.colors.text.secondary, textAlign: "center" },
    card: { backgroundColor: theme.colors.background.elevated, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border.light, padding: 18 },
    inputContainer: { marginBottom: 14 },
    twoColRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
    label: { fontSize: 12, fontWeight: "700", color: theme.colors.text.secondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 },
    inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: 14, backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.primary, paddingHorizontal: 12, height: 52 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: theme.colors.text.primary, fontSize: 15, fontWeight: "600" },
    switchRow: { marginTop: 2, marginBottom: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.background.primary, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    switchTitle: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 14 },
    switchSubtitle: { marginTop: 3, color: theme.colors.text.secondary, fontWeight: "700", fontSize: 12 },
    errorBox: { marginTop: 2, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.error + "55", backgroundColor: theme.colors.error + "10", flexDirection: "row", alignItems: "center", gap: 10 },
    errorText: { flex: 1, color: theme.colors.error, fontSize: 13, fontWeight: "700" },
    primaryButton: { marginTop: 4, borderRadius: 14, overflow: "hidden" },
    primaryButtonGradient: { height: 54, alignItems: "center", justifyContent: "center" },
    primaryButtonText: { color: theme.colors.text.inverse, fontSize: 16, fontWeight: "800" },
  });
}

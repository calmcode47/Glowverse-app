import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, AccessibilityInfo } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Address } from "../../services/api/orders.api";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

type Draft = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<void>;
};

export default function AddressForm({ visible, onClose, onSave }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [draft, setDraft] = React.useState<Draft>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: ""
  });
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const refs = {
    fullName: React.useRef<TextInput>(null as any),
    street: React.useRef<TextInput>(null as any),
    city: React.useRef<TextInput>(null as any),
    state: React.useRef<TextInput>(null as any),
    postalCode: React.useRef<TextInput>(null as any),
    country: React.useRef<TextInput>(null as any),
    phone: React.useRef<TextInput>(null as any)
  };

  const validateField = (field: keyof Draft, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    // Clear error for this field first
    delete errors[field];

    // Validate postal code format
    if (field === 'postalCode' && value && !/^\d{5}(-\d{4})?$/.test(value)) {
      errors.postalCode = 'Invalid postal code (use 12345 or 12345-6789)';
    }

    // Validate phone number format
    if (field === 'phone' && value) {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
        errors.phone = 'Phone must be 10 digits';
      }
    }

    setFieldErrors(errors);
  };

  const validate = () => {
    if (!draft.fullName || !draft.street || !draft.city || !draft.state || !draft.postalCode || !draft.country) {
      const errors: Record<string, string> = {};
      if (!draft.fullName) errors.fullName = "Full name is required";
      if (!draft.street) errors.street = "Street is required";
      if (!draft.city) errors.city = "City is required";
      if (!draft.state) errors.state = "State is required";
      if (!draft.postalCode) errors.postalCode = "Postal code is required";
      if (!draft.country) errors.country = "Country is required";

      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0] as keyof typeof refs;
      setError("Please fill in all required fields");
      try {
        // @ts-ignore
        refs[firstKey]?.current?.focus?.();
      } catch { }
      try {
        const fieldLabel = String(firstKey).replace(/([A-Z])/g, " $1");
        AccessibilityInfo.announceForAccessibility?.(`Error in ${fieldLabel}: ${errors[firstKey as keyof typeof errors]}`);
      } catch { }
      return false;
    }

    // Check for format errors
    if (Object.keys(fieldErrors).length > 0) {
      setError("Please fix the errors below");
      return false;
    }

    return true;
  };

  const handleFieldChange = (field: keyof Draft, value: string) => {
    setDraft({ ...draft, [field]: value });
    validateField(field, value);
    if (error) setError(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Address</Text>
          <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
            <View>
              <TextInput
                ref={refs.fullName}
                style={[styles.input, fieldErrors.fullName && styles.inputError]}
                placeholder="Full Name *"
                value={draft.fullName}
                onChangeText={(t) => handleFieldChange('fullName', t)}
                onBlur={() => validateField('fullName', draft.fullName)}
                {...useTestID(TestIDs.CHECKOUT.SHIPPING_NAME_INPUT)}
              />
              {fieldErrors.fullName && <Text style={styles.errorText}>{fieldErrors.fullName}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.street}
                style={[styles.input, fieldErrors.street && styles.inputError]}
                placeholder="Street Address *"
                value={draft.street}
                onChangeText={(t) => handleFieldChange('street', t)}
                onBlur={() => validateField('street', draft.street)}
              />
              {fieldErrors.street && <Text style={styles.errorText}>{fieldErrors.street}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.city}
                style={[styles.input, fieldErrors.city && styles.inputError]}
                placeholder="City *"
                value={draft.city}
                onChangeText={(t) => handleFieldChange('city', t)}
                onBlur={() => validateField('city', draft.city)}
              />
              {fieldErrors.city && <Text style={styles.errorText}>{fieldErrors.city}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.state}
                style={[styles.input, fieldErrors.state && styles.inputError]}
                placeholder="State/Province *"
                value={draft.state}
                onChangeText={(t) => handleFieldChange('state', t)}
                onBlur={() => validateField('state', draft.state)}
              />
              {fieldErrors.state && <Text style={styles.errorText}>{fieldErrors.state}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.postalCode}
                style={[styles.input, fieldErrors.postalCode && styles.inputError]}
                placeholder="Postal Code *"
                value={draft.postalCode}
                onChangeText={(t) => handleFieldChange('postalCode', t)}
                onBlur={() => validateField('postalCode', draft.postalCode)}
                keyboardType="numeric"
              />
              {fieldErrors.postalCode && <Text style={styles.errorText}>{fieldErrors.postalCode}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.country}
                style={[styles.input, fieldErrors.country && styles.inputError]}
                placeholder="Country *"
                value={draft.country}
                onChangeText={(t) => handleFieldChange('country', t)}
                onBlur={() => validateField('country', draft.country)}
              />
              {fieldErrors.country && <Text style={styles.errorText}>{fieldErrors.country}</Text>}
            </View>

            <View>
              <TextInput
                ref={refs.phone}
                style={[styles.input, fieldErrors.phone && styles.inputError]}
                placeholder="Phone Number"
                value={draft.phone}
                onChangeText={(t) => handleFieldChange('phone', t)}
                onBlur={() => validateField('phone', draft.phone)}
                keyboardType="phone-pad"
              />
              {fieldErrors.phone && <Text style={styles.errorText}>{fieldErrors.phone}</Text>}
            </View>

            {error ? <Text style={{ color: theme.colors.error, marginTop: 4 }}>{error}</Text> : null}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.secondary}><Text style={styles.secondaryText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                setError(null);
                if (!validate()) return;
                setLoading(true);
                try {
                  await onSave(draft);
                  onClose();
                } catch (e: any) {
                  setError(e?.message || "Failed to save");
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.primary}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.colors.background.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border.light, maxHeight: "80%" },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 16, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.secondary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      color: theme.colors.text.primary
    },
    inputError: {
      borderColor: theme.colors.error,
      borderWidth: 1.5,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
    secondary: { paddingHorizontal: 14, paddingVertical: 10 },
    secondaryText: { color: theme.colors.text.primary, fontWeight: "700" },
    primary: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}

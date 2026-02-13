import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";

type Props = { onPress: () => void; disabled?: boolean };

export default function CaptureButton({ onPress, disabled }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.wrap, disabled && { opacity: 0.6 }]}>
      <View style={styles.inner}>
        <LinearGradient colors={theme.colors.gradients.primary} style={styles.gradient}>
          <MaterialCommunityIcons name="camera" size={28} color={theme.colors.text.inverse} />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    wrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
    inner: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.background.elevated, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: theme.colors.border.light },
    gradient: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }
  });
}

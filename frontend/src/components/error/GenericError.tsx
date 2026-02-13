import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { useNavigation } from "@react-navigation/native";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export default function GenericError({ message, onRetry }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-circle-outline" size={48} color={theme.colors.accent.rose} />
      <Text style={styles.title}>{message || "Something went wrong"}</Text>
      <View style={styles.row}>
        {onRetry ? (
          <TouchableOpacity onPress={onRetry} style={styles.btn}>
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnOutline}>
          <Text style={styles.btnOutlineText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    row: { flexDirection: "row", gap: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, marginTop: 6 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnOutline: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, marginTop: 6 },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}

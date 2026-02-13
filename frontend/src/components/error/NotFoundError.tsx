import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { useNavigation } from "@react-navigation/native";

export default function NotFoundError() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="map-marker-question-outline" size={48} color={theme.colors.accent.blue} />
      <Text style={styles.title}>Page not found</Text>
      <TouchableOpacity onPress={() => navigation.navigate("HomeTab" as any)} style={styles.btn}>
        <Text style={styles.btnText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
    title: { color: theme.colors.text.primary, fontWeight: "800" },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, marginTop: 6 },
    btnText: { color: theme.colors.text.inverse, fontWeight: "900" }
  });
}

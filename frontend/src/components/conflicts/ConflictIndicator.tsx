import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { conflictQueue } from "../../services/conflictQueue.service";
import type { SyncConflict } from "../../types/conflicts";

export default function ConflictIndicator() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [conflicts, setConflicts] = React.useState<SyncConflict[]>([]);

  React.useEffect(() => {
    const unsub = conflictQueue.subscribe(setConflicts);
    setConflicts(conflictQueue.getConflicts());
    return unsub;
  }, []);

  if (conflicts.length === 0) return null;
  const count = conflicts.length;
  const first = conflicts[0];

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.banner}
        onPress={() => first && conflictQueue.focusConflict(first.id)}
        accessibilityLabel={`${count} sync ${count > 1 ? "conflicts" : "conflict"} need attention`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="alert" size={18} color={theme.colors.warning} />
        <Text style={styles.text}>
          {count} sync {count === 1 ? "issue" : "issues"}
        </Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      alignItems: "center",
      paddingTop: 6
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.colors.background.elevated,
      borderColor: theme.colors.border.light,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8
    },
    text: { color: theme.colors.text.primary, fontWeight: "700" }
  });
}


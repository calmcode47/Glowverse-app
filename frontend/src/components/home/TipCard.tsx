import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton, useTheme } from "react-native-paper";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
  icon: string;
  title: string;
  content: string;
};

export default function TipCard({ icon, title, content }: Props) {
  const theme = useTheme();
  const open = React.useState(false) as [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  const [expanded, setExpanded] = open;
  const h = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  React.useEffect(() => {
    h.value = withTiming(expanded ? 80 : 0, { duration: 200 });
  }, [expanded]);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.colors.primary} />
        <Text style={styles.title}>{title}</Text>
        <IconButton icon={expanded ? "chevron-up" : "chevron-down"} onPress={() => setExpanded((v) => !v)} />
      </View>
      <Animated.View style={[styles.content, style]}>
        <Text>{content}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, marginBottom: 12 },
  header: { flexDirection: "row", alignItems: "center" },
  title: { marginLeft: 8, flex: 1 },
  content: { overflow: "hidden" }
});

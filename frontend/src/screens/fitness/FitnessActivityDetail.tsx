import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as FitnessAPI from "../../services/api/fitness.api";

export default function FitnessActivityDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const id = route.params?.id as string;
  const [loading, setLoading] = React.useState(true);
  const [activity, setActivity] = React.useState<FitnessAPI.Activity | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await FitnessAPI.getActivities();
        setActivity(all.find(a => a.id === id) || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  if (!activity) return <View style={styles.center}><Text>Not found</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{activity.type}</Text>
      <Text style={styles.meta}>{new Date(activity.createdAt).toLocaleString()}</Text>
      <View style={styles.row}><Text style={styles.metric}>Duration</Text><Text style={styles.value}>{activity.duration} min</Text></View>
      <View style={styles.row}><Text style={styles.metric}>Calories</Text><Text style={styles.value}>{activity.calories}</Text></View>
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => navigation.goBack()}>Done</Button>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { padding: 16, gap: 8 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { color: theme.colors.text.primary, fontSize: 18, fontWeight: "900" },
    meta: { color: theme.colors.text.secondary },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.colors.border.light },
    metric: { color: theme.colors.text.primary, fontWeight: "800" },
    value: { color: theme.colors.text.secondary },
    actions: { flexDirection: "row", gap: 8, marginTop: 12 }
  });
}

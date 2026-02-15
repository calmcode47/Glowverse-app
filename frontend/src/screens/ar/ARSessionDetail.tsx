import React from "react";
import { View, StyleSheet, ScrollView, Image, FlatList } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { useTheme } from "../../theme/themeContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as TryOnAPI from "../../services/api/tryon.api";
import * as CartAPI from "../../services/api/cart.api";

export default function ARSessionDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const id = route.params?.id as string;
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<TryOnAPI.TryOn | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await TryOnAPI.getTryOn(id);
        setSession(res.tryOn);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!session) return <View style={styles.center}><Text>Not found</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AR Try-On</Text>
      <Text style={styles.meta}>{new Date(session.createdAt).toLocaleString()}</Text>
      {session.resultImageUrl ? <Image source={{ uri: session.resultImageUrl }} style={styles.hero} /> : null}
      <View style={styles.row}><Text style={styles.metric}>Product</Text><Text style={styles.value}>{session.productName || session.productId || "-"}</Text></View>
      <View style={styles.actions}>
        {session.productId ? <Button mode="contained" onPress={() => CartAPI.addItem({ productId: session.productId!, quantity: 1 })}>Add to Cart</Button> : null}
        <Button mode="outlined" onPress={() => navigation.goBack()}>Done</Button>
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
    hero: { width: "100%", aspectRatio: 1, borderRadius: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.colors.border.light },
    metric: { color: theme.colors.text.primary, fontWeight: "800" },
    value: { color: theme.colors.text.secondary },
    actions: { flexDirection: "row", gap: 8, marginTop: 12 }
  });
}

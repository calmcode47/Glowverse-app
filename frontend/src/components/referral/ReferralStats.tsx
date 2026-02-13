import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { ReferralFriend } from "../../services/api/referrals.api";

type Props = {
  total: number;
  earned: number;
  pending: number;
  friends: ReferralFriend[];
};

export default function ReferralStats({ total, earned, pending, friends }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.row}>
        <Stat label="Total Referrals" value={String(total)} />
        <Stat label="Rewards Earned" value={String(earned)} />
        <Stat label="Pending" value={String(pending)} />
      </View>
      <Text style={styles.title}>Referred Friends</Text>
      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.friend}>
            <Text style={[styles.friendName, { color: theme.colors.text.primary }]}>{item.name || "Friend"}</Text>
            <Text style={styles.friendMeta}>{new Date(item.joinedAt).toLocaleDateString()} • {item.status === "earned" ? "Reward Earned" : "Pending"}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.friendMeta}>No referrals yet</Text>}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 }}>
      <Text style={{ color: theme.colors.text.secondary }}>{label}</Text>
      <Text style={{ color: theme.colors.text.primary, fontWeight: "900", fontSize: 16 }}>{value}</Text>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    row: { flexDirection: "row", gap: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "900" },
    friend: { borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.elevated, borderRadius: 12, padding: 12 },
    friendName: { fontWeight: "800" },
    friendMeta: { color: theme.colors.text.secondary }
  });
}

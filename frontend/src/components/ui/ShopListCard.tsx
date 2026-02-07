import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@constants/theme";

type IconName = "cart" | "account" | "message-reply" | "close" | "cog";

type ShopListCardProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  onPress?: () => void;
};

const iconMap: Record<IconName, string> = {
  cart: "cart-outline",
  account: "account-outline",
  "message-reply": "message-reply-text-outline",
  close: "close",
  cog: "cog-outline",
};

export default function ShopListCard({ title, subtitle, icon = "cart", onPress }: ShopListCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.left}>
        <MaterialCommunityIcons
          name={iconMap[icon] as any}
          size={20}
          color={theme.colors.text.inverse}
        />
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderOrange,
    padding: theme.spacing.scale[4],
    marginHorizontal: 16,
    marginVertical: 6,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  textWrap: {
    marginLeft: 12,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.text.inverse,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
});

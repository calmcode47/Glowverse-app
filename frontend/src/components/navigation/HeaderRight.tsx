import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Badge, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";
import { useCart } from "../../context/CartContext";

type Props = {
  notifications?: number;
};

export default function HeaderRight({ notifications = 0 }: Props) {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { count } = useCart();

  return (
    <View style={styles.container} accessibilityLabel="Header actions">
      <View>
        <IconButton
          icon="cart"
          size={24}
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Open cart"
        />
        {count > 0 && (
          <Badge style={[styles.badge, { backgroundColor: theme.colors.primary }]}>{count}</Badge>
        )}
      </View>
      <View>
        <IconButton
          icon="cog"
          size={24}
          onPress={() => navigation.navigate("Settings")}
          accessibilityLabel="Open settings"
        />
        {notifications > 0 && (
          <Badge style={[styles.badge, { backgroundColor: theme.colors.error }]}>{notifications}</Badge>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  badge: {
    position: "absolute",
    right: 6,
    top: 6
  }
});

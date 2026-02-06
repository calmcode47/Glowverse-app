import React from "react";
import { View } from "react-native";
import { List, Switch, useTheme, Text } from "react-native-paper";

type Type = "navigation" | "toggle" | "select";

type Props = {
  icon: string;
  label: string;
  value?: string | boolean;
  type: Type;
  onPress?: () => void;
};

export default function SettingItem({ icon, label, value, type, onPress }: Props) {
  const theme = useTheme();
  return (
    <List.Item
      title={label}
      left={(props) => <List.Icon {...props} icon={icon} />}
      right={(props) =>
        type === "navigation" ? (
          <List.Icon {...props} icon="chevron-right" />
        ) : type === "toggle" ? (
          <Switch value={Boolean(value)} onValueChange={onPress} />
        ) : (
          <Text>{String(value || "")}</Text>
        )
      }
      onPress={onPress}
    />
  );
}

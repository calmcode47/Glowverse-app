import React from "react";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@navigation/types";

type Props = {
  accessibilityLabel?: string;
};

export default function BackButton({ accessibilityLabel = "Go back" }: Props) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <IconButton
      icon="arrow-left"
      size={24}
      onPress={() => navigation.goBack()}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, ViewStyle } from "react-native";
import { Card as PaperCard, Text, Badge, useTheme } from "react-native-paper";

type Props = {
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  style?: ViewStyle;
  children?: React.ReactNode;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  imageUri?: string;
  badgeCount?: number;
};

export default function Card({
  elevation = 2,
  style,
  children,
  onPress,
  title,
  subtitle,
  imageUri,
  badgeCount
}: Props) {
  const theme = useTheme();
  const content = (
    <View>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.cover} /> : null}
      {(title || subtitle) && (
        <View style={styles.texts}>
          {title ? <Text variant="titleMedium">{title}</Text> : null}
          {subtitle ? <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>{subtitle}</Text> : null}
        </View>
      )}
      {children}
      {badgeCount ? <Badge style={styles.badge}>{badgeCount}</Badge> : null}
    </View>
  );
  return (
    <PaperCard style={[styles.card, style]} elevation={elevation}>
      {onPress ? <TouchableOpacity onPress={onPress} accessibilityRole="button">{content}</TouchableOpacity> : content}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: { overflow: "hidden" },
  cover: { width: "100%", height: 160 },
  texts: { padding: 12 },
  badge: { position: "absolute", right: 8, top: 8 }
});

import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { useFavorites } from "../../context/FavoritesContext";

type Props = {
  productId: string;
  size?: number;
  color?: string;
};

export default function FavoriteButton({ productId, size = 20, color }: Props) {
  const { theme } = useTheme();
  const styles = createStyles();
  const { isFavorite, add, removeByProductId } = useFavorites();
  const fav = isFavorite(productId);
  return (
    <TouchableOpacity
      onPress={async () => {
        if (!fav) {
          await add(productId);
        } else {
          await removeByProductId(productId);
        }
      }}
      style={styles.btn}
    >
      <MaterialCommunityIcons
        name={fav ? "heart" : "heart-outline"}
        size={size}
        color={color || (fav ? theme.colors.accent.rose : theme.colors.text.primary)}
      />
    </TouchableOpacity>
  );
}

function createStyles() {
  return StyleSheet.create({
    btn: { alignItems: "center", justifyContent: "center" }
  });
}

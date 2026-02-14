import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";
import { a11y, touchTarget } from "../../utils/a11y";
import { useFavorites } from "../../context/FavoritesContext";

type Props = {
  productId: string;
  size?: number;
  color?: string;
  productName?: string;
  price?: number;
  source?: "product_detail" | "product_list";
};

export default function FavoriteButton({ productId, size = 20, color, productName, price, source = "product_list" }: Props) {
  const { theme } = useTheme();
  const styles = createStyles();
  const { isFavorite, add, removeByProductId } = useFavorites();
  const fav = isFavorite(productId);
  return (
    <TouchableOpacity
      onPress={async () => {
        if (!fav) {
          await add(productId);
          analytics.trackEvent(AnalyticsEventName.ADD_TO_WISHLIST, {
            item_id: productId,
            item_name: productName,
            price,
            currency: "USD",
            source
          });
        } else {
          await removeByProductId(productId);
          analytics.trackEvent(AnalyticsEventName.REMOVE_FROM_WISHLIST, {
            item_id: productId,
            item_name: productName,
            price,
            currency: "USD",
            source
          });
        }
      }}
      style={[styles.btn, touchTarget()]}
      {...a11y(fav ? "Remove from favorites" : "Add to favorites", { hint: fav ? "Double tap to remove this product" : "Double tap to save this product", role: "button" })}
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

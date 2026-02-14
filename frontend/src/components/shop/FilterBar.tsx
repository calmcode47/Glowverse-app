import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeContext";
import FilterChip from "./FilterChip";
import { TestIDs } from "../../constants/testIDs";
import { useTestID } from "../../hooks/useTestID";

export type Filters = {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
};

type Props = {
  filters: Filters;
  onOpenFilters: () => void;
  onClearAll: () => void;
};

export default function FilterBar({ filters, onOpenFilters, onClearAll }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const hasAny = Object.values(filters).some((v) => v !== undefined && v !== null && v !== "");
  const filterBtnTest = useTestID(TestIDs.PRODUCT_LIST.FILTER_BUTTON);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onOpenFilters} style={styles.primaryBtn} {...filterBtnTest}>
        <MaterialCommunityIcons name="filter-variant" size={18} color={theme.colors.text.inverse} />
        <Text style={styles.btnText}>Filters</Text>
      </TouchableOpacity>
      {hasAny ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {filters.category ? <FilterChip label={`Category: ${filters.category}`} /> : null}
            {filters.brand ? <FilterChip label={`Brand: ${filters.brand}`} /> : null}
            {filters.sortBy ? <FilterChip label={`Sort: ${filters.sortBy}`} /> : null}
            {filters.minPrice !== undefined || filters.maxPrice !== undefined ? (
              <FilterChip label={`Price: ${filters.minPrice ?? 0}-${filters.maxPrice ?? "∞"}`} />
            ) : null}
          </ScrollView>
          <TouchableOpacity onPress={onClearAll} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close" size={16} color={theme.colors.text.primary} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8
    },
    primaryBtn: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.accent.emerald,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10
    },
    btnText: {
      color: theme.colors.text.inverse,
      fontWeight: "700",
      fontSize: 12
    },
    chips: {
      paddingVertical: 4
    },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 6
    },
    clearText: {
      color: theme.colors.text.primary,
      fontSize: 12,
      fontWeight: "600"
    }
  });
}

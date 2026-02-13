import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/themeContext";
import { categories } from "../../data/products";

const { width } = Dimensions.get("window");
const CARD = (width - 16 * 2 - 12) / 2;

export default function CategoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <FlatList
        data={categories as any}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 16, marginBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { width: CARD }]}
            onPress={() => navigation.navigate("ShopTab", { category: item.id })}
          >
            <View style={[styles.iconWrap, { backgroundColor: item.color + "25" }]}>
              <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
      paddingTop: 8
    },
    card: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      alignItems: "center",
      paddingVertical: 16
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8
    },
    name: {
      color: theme.colors.text.primary,
      fontWeight: "700"
    }
  });
}

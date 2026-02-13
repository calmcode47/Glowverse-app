import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Product } from "../../data/products";

type Props = {
  visible: boolean;
  product: Product;
  onAdd: (variantId?: string) => Promise<void>;
  onDismiss: () => void;
};

export default function QuickVariantModal({ visible, product, onAdd, onDismiss }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [selectedSize, setSelectedSize] = React.useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = React.useState<string | undefined>(product.colors?.[0]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    setSelectedSize(product.sizes?.[0]);
    setSelectedColor(product.colors?.[0]);
  }, [product]);
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{product.name}</Text>
          {product.colors && product.colors.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {product.colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[styles.choice, selectedColor === c && styles.choiceActive]}
                  >
                    <Text style={[styles.choiceText, selectedColor === c && styles.choiceTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
          {product.sizes && product.sizes.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Size</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {product.sizes.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSize(s)}
                    style={[styles.choice, selectedSize === s && styles.choiceActive]}
                  >
                    <Text style={[styles.choiceText, selectedSize === s && styles.choiceTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onDismiss} style={styles.secondary}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                setLoading(true);
                try {
                  await onAdd(undefined);
                  onDismiss();
                } finally {
                  setLoading(false);
                }
              }}
              style={styles.primary}
              disabled={loading}
            >
              <Text style={styles.primaryText}>{loading ? "Adding..." : "Add to Cart"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 16 },
    label: { color: theme.colors.text.secondary, marginBottom: 6 },
    choice: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border.light
    },
    choiceActive: {
      borderColor: theme.colors.accent.emerald,
      backgroundColor: theme.colors.accent.emerald + "10"
    },
    choiceText: { color: theme.colors.text.primary, fontWeight: "700" },
    choiceTextActive: { color: theme.colors.accent.emerald },
    actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 12 },
    secondary: { paddingHorizontal: 14, paddingVertical: 10 },
    secondaryText: { color: theme.colors.text.primary, fontWeight: "700" },
    primary: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.colors.accent.emerald, borderRadius: 10 },
    primaryText: { color: theme.colors.text.inverse, fontWeight: "800" }
  });
}

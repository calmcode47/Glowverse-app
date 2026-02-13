import React from "react";
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Share, Alert } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { TryOn } from "../../services/api/tryon.api";
import * as TryOnAPI from "../../services/api/tryon.api";
import * as CartAPI from "../../services/api/cart.api";

type Props = {
  visible: boolean;
  item?: TryOn | null;
  onClose: () => void;
  onDeleted?: (id: string) => void;
};

export default function TryOnDetailModal({ visible, item, onClose, onDeleted }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  if (!item) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Image source={{ uri: item.resultImageUrl || item.originalImageUrl }} style={styles.image} />
          <Text style={styles.title}>{item.productName || item.productId || "Makeup Try-On"}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.btnPrimary} onPress={async () => item.productId && CartAPI.addItem({ productId: item.productId, quantity: 1 })}>
              <Text style={styles.btnPrimaryText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOutline} onPress={async () => Share.share({ url: item.resultImageUrl || "", message: "Check my look!" })}>
              <Text style={styles.btnOutlineText}>Share</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={async () => {
                try {
                  await TryOnAPI.saveFavorite(item.id);
                } catch {}
              }}
            >
              <Text style={styles.btnOutlineText}>Favorite</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: theme.colors.error }]}
              onPress={async () => {
                Alert.alert("Delete Try-On", "Are you sure you want to delete this try-on?", [
                  { text: "Cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await TryOnAPI.deleteTryOn(item.id);
                        onDeleted?.(item.id);
                        onClose();
                      } catch {}
                    }
                  }
                ]);
              }}
            >
              <Text style={[styles.btnOutlineText, { color: theme.colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={{ alignSelf: "center", marginTop: 8 }}>
            <Text style={{ color: theme.colors.text.secondary }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
    sheet: { backgroundColor: theme.colors.background.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: theme.colors.border.light, maxHeight: "90%" },
    image: { width: "100%", aspectRatio: 1, borderRadius: 12, marginBottom: 8 },
    title: { color: theme.colors.text.primary, fontWeight: "800", fontSize: 16, marginBottom: 8 },
    row: { flexDirection: "row", gap: 8 },
    btnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.colors.accent.emerald, alignItems: "center" },
    btnPrimaryText: { color: theme.colors.text.inverse, fontWeight: "900" },
    btnOutline: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border.light, alignItems: "center" },
    btnOutlineText: { color: theme.colors.text.primary, fontWeight: "800" }
  });
}

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/themeContext";
import type { Promotion } from "../../services/api/promotions.api";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { deepLinkingService } from "../../services/deepLinking.service";
import { usePromoAnalytics } from "../../hooks/analytics/usePromoAnalytics";

type Props = {
  promo: Promotion;
  featured?: boolean;
  onPress: () => void;
  onShop: (code?: string) => void;
  onCopied?: () => void;
};

export default function PromotionCard({ promo, featured, onPress, onShop, onCopied }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme, featured);
  const { trackPromoViewed, trackPromoCopied } = usePromoAnalytics();
  const exp = promo.expiresAt ? new Date(promo.expiresAt) : null;
  const ms = exp ? exp.getTime() - Date.now() : null;
  const soon = ms !== null && ms > 0 && ms < 24 * 60 * 60 * 1000;
  const countdown = ms && ms > 0 ? formatDuration(ms) : null;
  return (
    <TouchableOpacity onPress={() => { trackPromoViewed(promo.code); onPress(); }} style={styles.card}>
      {promo.image ? <Image source={{ uri: promo.image }} style={styles.image} /> : <View style={[styles.image, { backgroundColor: theme.colors.background.secondary }]} />}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>{promo.title}</Text>
          {promo.discountLabel ? <Text style={[styles.badge, { backgroundColor: theme.colors.accent.emerald }]}>{promo.discountLabel}</Text> : null}
        </View>
        {promo.description ? <Text style={styles.desc} numberOfLines={2}>{promo.description}</Text> : null}
        {promo.code ? (
          <View style={styles.promoCodeContainer}>
            <View style={styles.dashedBorder}>
              <Text style={styles.code}>{promo.code}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(promo.code!);
                    trackPromoCopied(promo.code!);
                    onCopied?.();
                  } catch {
                    onCopied?.();
                  }
                }}
              >
                <MaterialCommunityIcons name="content-copy" size={16} color={theme.colors.accent.blue} />
                <Text style={styles.copy}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <View style={styles.footer}>
          {countdown ? <Text style={[styles.expiry, soon && { color: theme.colors.accent.rose }]}>Ends in {countdown}</Text> : exp ? <Text style={styles.expiry}>Expires {exp.toLocaleDateString()}</Text> : null}
          <View style={styles.actions}>
            <Button mode="contained-tonal" compact onPress={() => onShop(promo.code)}>Shop Now</Button>
            <TouchableOpacity
              style={styles.iconShare}
              onPress={async () => {
                const link = deepLinkingService.createUniversalLink("promo", { code: promo.code || "" });
                const message = `Check out this deal: ${promo.title}. Use code ${promo.code}. ${link}`;
                try { await Share.share({ message }); } catch { }
              }}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function createStyles(theme: any, featured?: boolean) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 12,
      ...theme.shadows.sm
    },
    image: { width: "100%", aspectRatio: featured ? 2 : 2.4 },
    content: { padding: 16, gap: 12 },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { color: theme.colors.text.primary, fontWeight: "900", fontSize: 16, flex: 1, marginRight: 8 },
    badge: { color: theme.colors.text.inverse, fontWeight: "900", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 12 },
    desc: { color: theme.colors.text.secondary, fontSize: 13, lineHeight: 18 },
    promoCodeContainer: {
      marginTop: 4,
    },
    dashedBorder: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: theme.colors.accent.emerald,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 12,
      backgroundColor: theme.colors.accent.emerald + '05',
    },
    code: {
      color: theme.colors.accent.emerald,
      fontWeight: "900",
      letterSpacing: 2,
      fontSize: 18,
      textTransform: "uppercase"
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border.light,
    },
    copy: { color: theme.colors.accent.blue, fontWeight: "800", fontSize: 12 },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconShare: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.background.secondary,
    },
    expiry: { color: theme.colors.text.tertiary, fontSize: 11 }
  });
}

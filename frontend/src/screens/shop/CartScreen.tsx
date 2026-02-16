import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useTheme } from "../../theme/themeContext";
import ProfessionalBackground from "../../components/animated/ProfessionalBackground";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as CartAPI from "../../services/api/cart.api";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCart from "../../components/cart/EmptyCart";
import PromoCodeInput from "../../components/cart/PromoCodeInput";
import { useCart } from "../../context/CartContext";
import { analytics } from "../../services/analytics.service";
import { usePromoAnalytics } from "../../hooks/analytics/usePromoAnalytics";

export default function CartScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { setCount } = useCart();
  const { trackPromoApplied, trackPromoFailed } = usePromoAnalytics();
  const [cart, setCart] = React.useState<CartAPI.Cart | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const c = await CartAPI.getCart();
      setCart(c);
      setCount(c.itemCount);
    } catch (e: any) {
      setError(e?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
      analytics.logScreenView("Cart", "CartScreen");
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const optimisticUpdate = (itemId: string, delta: number) => {
    setCart((c: CartAPI.Cart | null) => {
      if (!c) return c;
      const items = c.items.map((it: CartAPI.CartItem) => {
        if (it.id !== itemId) return it;
        const q = Math.max(1, it.quantity + delta);
        return { ...it, quantity: q, total: q * it.price };
      });
      const itemCount = items.reduce((n: number, it: CartAPI.CartItem) => n + it.quantity, 0);
      const subtotal = items.reduce((s: number, it: CartAPI.CartItem) => s + it.total, 0);
      const total = subtotal + c.tax + c.shipping - (c.promo?.discountAmount || 0);
      return { ...c, items, itemCount, subtotal, total };
    });
  };

  const rollback = async () => {
    const c = await CartAPI.getCart();
    setCart(c);
    setCount(c.itemCount);
  };

  const inc = async (id: string) => {
    setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: true }));
    optimisticUpdate(id, 1);
    try {
      const it = cart?.items.find((x: CartAPI.CartItem) => x.id === id);
      if (!it) throw new Error("Not found");
      await CartAPI.updateItemQuantity(id, it.quantity + 1);
      const c = await CartAPI.getCart();
      setCart(c);
      setCount(c.itemCount);
    } catch {
      await rollback();
    } finally {
      setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: false }));
    }
  };

  const dec = async (id: string) => {
    const it = cart?.items.find((x: CartAPI.CartItem) => x.id === id);
    if (!it || it.quantity <= 1) return;
    setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: true }));
    optimisticUpdate(id, -1);
    try {
      await CartAPI.updateItemQuantity(id, it.quantity - 1);
      const c = await CartAPI.getCart();
      setCart(c);
      setCount(c.itemCount);
    } catch {
      await rollback();
    } finally {
      setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: false }));
    }
  };

  const remove = async (id: string) => {
    setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: true }));
    setCart((c: CartAPI.Cart | null) =>
      c
        ? {
            ...c,
            items: c.items.filter((x: CartAPI.CartItem) => x.id !== id),
            itemCount: Math.max(0, c.itemCount - ((c.items.find((x: CartAPI.CartItem) => x.id === id)?.quantity as number) || 0))
          }
        : c
    );
    try {
      const item = cart?.items.find((x) => x.id === id);
      await CartAPI.removeItem(id);
      const c = await CartAPI.getCart();
      setCart(c);
      setCount(c.itemCount);
      if (item) await analytics.logRemoveFromCart(item);
    } catch {
      await rollback();
    } finally {
      setUpdating((u: Record<string, boolean>) => ({ ...u, [id]: false }));
    }
  };

  const applyPromo = async (code: string) => {
    try {
      const applied = await CartAPI.applyPromoCode(code);
      const c = await CartAPI.getCart();
      setCart(c);
      trackPromoApplied(applied.code, applied.discountType === "fixed" ? "fixed" : "percentage", applied.discountValue, c.total);
    } catch (e: any) {
      trackPromoFailed(code, e?.message);
      throw e;
    }
  };

  const removePromo = async () => {
    await CartAPI.removePromoCode();
    const c = await CartAPI.getCart();
    setCart(c);
  };

  const outOfStock = cart?.items?.some((it: CartAPI.CartItem) => it.product && it.product.inStock === false) || false;

  if (loading && !cart) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="subtle" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.colors.text.primary }}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error && !cart) {
    return (
      <View style={styles.container}>
        <ProfessionalBackground variant="subtle" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ color: theme.colors.error }}>{error}</Text>
          <TouchableOpacity onPress={load} style={{ backgroundColor: theme.colors.accent.emerald, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
            <Text style={{ color: theme.colors.text.inverse, fontWeight: "800" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfessionalBackground variant="subtle" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Your Cart</Text>
        <View style={{ width: 40 }} />
      </View>
      {!cart || cart.items.length === 0 ? (
        <EmptyCart onBrowse={() => (navigation as any).navigate("MainTabs", { screen: "ShopTab" })} />
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews
            renderItem={({ item }: { item: CartAPI.CartItem }) => (
              <CartItem
                item={item}
                onIncrease={() => inc(item.id)}
                onDecrease={() => dec(item.id)}
                onRemove={() => remove(item.id)}
                updating={!!updating[item.id]}
              />
            )}
            ListHeaderComponent={<PromoCodeInput applied={cart.promo || null} onApply={applyPromo} onRemove={removePromo} />}
          />
          <CartSummary
            cart={cart}
            outOfStock={outOfStock}
            onCheckout={() => {
              if (cart) analytics.logBeginCheckout(cart);
              navigation.navigate("Checkout");
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

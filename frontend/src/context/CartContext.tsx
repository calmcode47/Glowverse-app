import React from "react";
import * as CartAPI from "../services/api/cart.api";
import type { Product } from "../data/products";
import NetInfo from "@react-native-community/netinfo";
import { analytics } from "../services/analytics.service";

export type CartContextType = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  addItemOptimistic?: (product: Product, quantity: number) => Promise<void>;
};

const CartContext = React.createContext<CartContextType>({
  count: 0,
  setCount: () => {}
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = React.useState(0);
  const addItemOptimistic = React.useCallback(async (product: Product, quantity: number) => {
    setCount((c) => c + quantity);
    try {
      const state = await NetInfo.fetch();
      await CartAPI.addItem({ productId: product.id, quantity });
      await analytics.logAddToCart({
        id: "tmp",
        productId: product.id,
        product,
        quantity,
        price: product.price,
        total: product.price * quantity
      } as any);
      if (!state.isConnected) {
        // queued case handled via interceptor; keep optimistic count
      }
    } catch (e: any) {
      if (e?.message !== "OFFLINE_QUEUED" && !e?.__offlineQueued) {
        setCount((c) => Math.max(0, c - quantity));
      }
    }
  }, []);
  const value: CartContextType = { count, setCount, addItemOptimistic };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return React.useContext(CartContext);
}

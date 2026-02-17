import React from "react";
import * as CartAPI from "../services/api/cart.api";
import type { Product } from "../data/products";
import { analytics } from "../services/analytics.service";

export type CartContextType = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  addItemOptimistic?: (product: Product, quantity: number) => Promise<void>;
};

const CartContext = React.createContext<CartContextType>({
  count: 0,
  setCount: () => { }
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = React.useState(0);
  const addItemOptimistic = React.useCallback(async (product: Product, quantity: number) => {
    try {
      await CartAPI.addItem({ productId: product.id, quantity });
      await analytics.logAddToCart({
        id: "tmp",
        productId: product.id,
        product,
        quantity,
        price: product.price,
        total: product.price * quantity
      } as any);
      setCount((c) => c + quantity);
    } catch (e: any) {
      // rely on UI-level error handling; do not modify count on failure
    }
  }, []);
  const value: CartContextType = { count, setCount, addItemOptimistic };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return React.useContext(CartContext);
}

import React from "react";

export type CartContextType = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
};

const CartContext = React.createContext<CartContextType>({
  count: 0,
  setCount: () => {}
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = React.useState(0);
  const value: CartContextType = { count, setCount };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return React.useContext(CartContext);
}

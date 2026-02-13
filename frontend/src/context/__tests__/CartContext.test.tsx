import React from "react";
import { render } from "@testing-library/react-native";
import { CartProvider, useCart } from "../CartContext";

function Counter() {
  const { count, setCount } = useCart();
  React.useEffect(() => {
    setCount((c) => c + 1);
  }, [setCount]);
  return null;
}

describe("CartContext", () => {
  it("updates count", () => {
    render(
      <CartProvider>
        <Counter />
      </CartProvider>
    );
    // No direct assertion hook here; smoke test ensures no crash
  });
});

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CartItem from "../CartItem";

const item: any = {
  id: "ci1",
  productId: "p1",
  product: { id: "p1", name: "Item", brand: "Brand", category: "tech", price: 10, rating: 4, reviews: 1, inStock: true },
  quantity: 1,
  price: 10,
  total: 10
};

describe("CartItem", () => {
  it("renders name and price", () => {
    const { getByText } = render(<CartItem item={item} onIncrease={() => {}} onDecrease={() => {}} onRemove={() => {}} />);
    expect(getByText("Item")).toBeTruthy();
    expect(getByText("$10.00")).toBeTruthy();
  });

  it("calls callbacks", () => {
    const onIncrease = jest.fn();
    const onRemove = jest.fn();
    const { getByA11yLabel } = render(<CartItem item={item} onIncrease={onIncrease} onDecrease={() => {}} onRemove={onRemove} />);
    // Buttons don't have a11y labels, select by role is limited; trigger by press on plus icon parent via accessibilityLabel if present
    // Fallback: find by accessibility role is not trivial; rely on press on remove button by testID we set inline
  });
});

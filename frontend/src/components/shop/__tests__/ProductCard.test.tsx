import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProductCard from "../ProductCard";
import { ThemeProvider } from "../../../theme/themeContext";

jest.mock("../../../context/CartContext", () => ({
  useCart: () => ({ count: 0, setCount: jest.fn() })
}));
jest.mock("../../../services/api/cart.api", () => ({
  addItem: jest.fn(async () => ({ id: "it1" }))
}));

const product = {
  id: "1",
  name: "Lipstick",
  brand: "Glow",
  category: "tech",
  price: 29.99,
  rating: 4.5,
  reviews: 10,
  image: "https://example.com/img.jpg",
  inStock: true,
  description: "",
  features: []
};

describe("ProductCard", () => {
  it("renders product information", () => {
    const { getByText } = render(<ThemeProvider><ProductCard product={product as any} /></ThemeProvider>);
    expect(getByText("Glow")).toBeTruthy();
    expect(getByText("Lipstick")).toBeTruthy();
    expect(getByText("$29.99")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ThemeProvider><ProductCard product={product as any} onPress={onPress} /></ThemeProvider>);
    fireEvent.press(getByTestId("product-card"));
    expect(onPress).toHaveBeenCalled();
  });

  it("shows out of stock badge when not in stock", () => {
    const p = { ...product, inStock: false };
    const { getByText } = render(<ThemeProvider><ProductCard product={p as any} /></ThemeProvider>);
    expect(getByText("Out of Stock")).toBeTruthy();
  });
});

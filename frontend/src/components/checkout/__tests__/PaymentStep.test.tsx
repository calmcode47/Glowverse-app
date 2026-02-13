import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PaymentStep from "../PaymentStep";

describe("PaymentStep", () => {
  it("calls onSelect when method tapped", () => {
    const onSelect = jest.fn();
    const { getByText } = render(<PaymentStep selected="card" onSelect={onSelect} />);
    fireEvent.press(getByText("PayPal"));
    expect(onSelect).toHaveBeenCalledWith("paypal");
  });
});

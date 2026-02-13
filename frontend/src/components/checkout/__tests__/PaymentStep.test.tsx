import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PaymentStep from "../PaymentStep";
import { ThemeProvider } from "../../../theme/themeContext";
import { useStripe } from "@stripe/stripe-react-native";

jest.mock("@stripe/stripe-react-native", () => {
  return {
    useStripe: jest.fn(() => ({
      createPaymentMethod: jest.fn(async () => ({ paymentMethod: { id: "pm_123" } }))
    })),
    useApplePay: jest.fn(() => ({
      isApplePaySupported: jest.fn(async () => false),
      presentApplePay: jest.fn(async () => ({ error: undefined, paymentMethod: undefined }))
    })),
    useGooglePay: jest.fn(() => ({
      initGooglePay: jest.fn(async () => ({ error: undefined })),
      presentGooglePay: jest.fn(async () => ({ error: undefined, paymentMethod: undefined }))
    })),
    CardField: ({ onCardChange }: any) => {
      if (onCardChange) onCardChange({ complete: true });
      return null;
    }
  };
});

describe("PaymentStep", () => {
  it("disables save until card valid, then creates payment method", async () => {
    const onNext = jest.fn();
    const { getByText } = render(<ThemeProvider><PaymentStep selected="card" onSelect={jest.fn()} onPaymentMethodReady={onNext} /></ThemeProvider>);
    fireEvent.press(getByText("Save Card"));
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledWith("pm_123");
    });
  });
});

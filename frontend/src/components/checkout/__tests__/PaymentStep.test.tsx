import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PaymentStep from "../PaymentStep";
import { ThemeProvider } from "../../../theme/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@stripe/stripe-react-native", () => {
  return {
    useStripe: jest.fn(() => ({
      createPaymentMethod: jest.fn(async () => ({
        paymentMethod: { id: "pm_123", card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2030 } }
      }))
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
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("disables save until card valid, then creates payment method", async () => {
    const onNext = jest.fn();
    const { getByText } = render(<ThemeProvider><PaymentStep selected="card" onSelect={jest.fn()} onPaymentMethodReady={onNext} /></ThemeProvider>);
    fireEvent.press(getByText("Save Card"));
    await waitFor(() => {
      expect(onNext).toHaveBeenCalledWith("pm_123");
    });
  });

  it("persists saved card and auto-selects it on next mount", async () => {
    const onNext1 = jest.fn();
    const rendered = render(<ThemeProvider><PaymentStep selected="card" onSelect={jest.fn()} onPaymentMethodReady={onNext1} /></ThemeProvider>);
    fireEvent.press(rendered.getByText("Save Card"));
    await waitFor(() => {
      expect(onNext1).toHaveBeenCalledWith("pm_123");
    });
    rendered.unmount();

    const onNext2 = jest.fn();
    const rendered2 = render(<ThemeProvider><PaymentStep selected="card" onSelect={jest.fn()} onPaymentMethodReady={onNext2} /></ThemeProvider>);
    await waitFor(() => {
      expect(rendered2.getByText("Saved cards")).toBeTruthy();
      expect(onNext2).toHaveBeenCalledWith("pm_123");
    });
  });
});

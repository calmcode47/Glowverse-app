import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CheckoutScreen from "../CheckoutScreen";

jest.mock("../../../theme/themeContext", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: { primary: "#fff", elevated: "#fafafa" },
        text: { primary: "#000", inverse: "#fff", secondary: "#333" },
        border: { light: "#eee" },
        accent: { emerald: "#0a0" }
      }
    }
  })
}));

jest.mock("../../../components/animated/ProfessionalBackground", () => () => null);
jest.mock("../../../components/checkout/ProgressIndicator", () => () => null);
jest.mock("../../../components/checkout/ShippingStep", () => {
  const React = require("react");
  return function ShippingStepMock({ onSelect }: { onSelect: (id: string) => void }) {
    React.useEffect(() => {
      onSelect("addr_1");
    }, [onSelect]);
    return null;
  };
});
jest.mock("../../../components/checkout/PaymentStep", () => {
  const React = require("react");
  return function PaymentStepMock({ onPaymentMethodReady }: { onPaymentMethodReady: (id: string) => void }) {
    React.useEffect(() => {
      onPaymentMethodReady("pm_123");
    }, [onPaymentMethodReady]);
    return null;
  };
});
jest.mock("../../../components/checkout/ReviewStep", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return function ReviewStepMock({ onPlaceOrder }: { onPlaceOrder: () => Promise<void> }) {
    return (
      <TouchableOpacity accessibilityLabel="place-order" onPress={() => onPlaceOrder()}>
        <Text>Place</Text>
      </TouchableOpacity>
    );
  };
});

const mockConfirmPayment = jest.fn(async () => ({ paymentIntent: { id: "pi_1", status: "succeeded" } }));
const mockHandleNextAction = jest.fn(async () => ({ paymentIntent: { id: "pi_1", status: "succeeded" } }));
const mockConfirmApplePayPayment = jest.fn();
const mockConfirmGooglePayPayment = jest.fn();
jest.mock("@stripe/stripe-react-native", () => ({
  useStripe: () => ({
    confirmPayment: mockConfirmPayment,
    handleNextAction: mockHandleNextAction,
    confirmApplePayPayment: mockConfirmApplePayPayment,
    confirmGooglePayPayment: mockConfirmGooglePayPayment
  })
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() })
}));

const mockSetCount = jest.fn();
jest.mock("../../../context/CartContext", () => ({
  useCart: () => ({ setCount: mockSetCount })
}));

jest.mock("../../../services/api/cart.api", () => ({
  getCart: jest.fn(async () => ({
    id: "c1",
    items: [
      {
        id: "i1",
        productId: "p1",
        product: { id: "p1", name: "Lipstick", brand: "Brand", category: "lipstick", price: 29.99, rating: 4, reviews: 2, inStock: true },
        quantity: 1,
        price: 29.99,
        total: 29.99
      }
    ],
    subtotal: 29.99,
    tax: 0,
    shipping: 0,
    total: 29.99,
    itemCount: 1
  })),
  clearCart: jest.fn(async () => {})
}));

jest.mock("../../../services/api/orders.api", () => ({
  createOrder: jest.fn(async () => ({
    id: "o1",
    status: "placed",
    items: [],
    subtotal: 29.99,
    tax: 0,
    shipping: 0,
    total: 29.99,
    createdAt: new Date().toISOString()
  }))
}));

jest.mock("../../../services/api/payments.api", () => ({
  createPaymentIntent: jest.fn(async () => ({ clientSecret: "cs_test", paymentIntentId: "pi_1" }))
}));

describe("CheckoutScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("completes card checkout happy path", async () => {
    const ui = render(<CheckoutScreen />);
    await waitFor(() => {
      const next1 = ui.getByText("Next");
      expect(next1).toBeTruthy();
    });
    fireEvent.press(ui.getByText("Next"));
    fireEvent.press(ui.getByText("Next"));
    fireEvent.press(ui.getByLabelText("place-order"));
    await waitFor(() => {
      expect(mockConfirmPayment).toHaveBeenCalledWith("cs_test", expect.anything());
      expect(mockNavigate).toHaveBeenCalledWith("OrderConfirmation", { orderId: "o1" });
      expect(mockSetCount).toHaveBeenCalledWith(0);
    });
  });
});

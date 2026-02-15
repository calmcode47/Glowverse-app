import { Platform } from "react-native";
const { useApplePay, useGooglePay } = require("@stripe/stripe-react-native");
import { ENV } from "../config/environment";

export type PlatformPaymentResult = {
  status: "succeeded" | "failed";
  error?: string;
  paymentMethodId?: string;
};

export const usePlatformPayments = () => {
  const apple = useApplePay();
  const google = useGooglePay();

  const isApplePaySupported = async (): Promise<boolean> => {
    if (Platform.OS !== "ios") return false;
    try {
      return await apple.isApplePaySupported();
    } catch {
      return false;
    }
  };

  const isGooglePaySupported = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return false;
    try {
      const { error } = await google.initGooglePay({
        testEnv: ENV.environment !== "production",
        merchantName: "Glowverse",
        countryCode: "US"
      });
      return !error;
    } catch {
      return false;
    }
  };

  const presentApplePay = async (amount: number): Promise<PlatformPaymentResult> => {
    try {
      const { error, paymentMethod } = await apple.presentApplePay({
        cartItems: [{ label: "Glowverse Order", amount: amount.toFixed(2), paymentType: "Immediate" as any }],
        country: "US",
        currency: "USD"
      });
      if (error) return { status: "failed", error: error.message };
      return { status: "succeeded", paymentMethodId: paymentMethod?.id };
    } catch (e: any) {
      return { status: "failed", error: e?.message || "Apple Pay failed" };
    }
  };

  const presentGooglePay = async (amount: number): Promise<PlatformPaymentResult> => {
    try {
      const { error, paymentMethod } = await google.presentGooglePay({
        currencyCode: "USD",
        amount
      });
      if (error) return { status: "failed", error: error.message };
      return { status: "succeeded", paymentMethodId: paymentMethod?.id };
    } catch (e: any) {
      return { status: "failed", error: e?.message || "Google Pay failed" };
    }
  };

  return { isApplePaySupported, isGooglePaySupported, presentApplePay, presentGooglePay };
};

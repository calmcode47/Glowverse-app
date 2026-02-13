import React from "react";
import { Banner } from "react-native-paper";

type Props = {
  error: string;
  onRetry: () => void;
  onChangePayment: () => void;
};

export default function PaymentError({ error, onRetry, onChangePayment }: Props) {
  function map(msg: string) {
    const m: Record<string, string> = {
      card_declined: "Your card was declined. Please try another payment method.",
      insufficient_funds: "Insufficient funds. Please use a different card.",
      expired_card: "Your card has expired. Please use a different card.",
      incorrect_cvc: "Incorrect security code. Please check and try again.",
      processing_error: "Payment processing error. Please try again.",
      authentication_required: "3D Secure authentication failed. Please try again."
    };
    return m[msg] || "Payment failed. Please try again or use a different payment method.";
  }
  return (
    <Banner
      visible
      actions={[
        { label: "Change Payment", onPress: onChangePayment },
        { label: "Retry", onPress: onRetry }
      ]}
      icon="alert-circle"
    >
      {map(error)}
    </Banner>
  );
}

export function formatPrice(price: number, currency: string = "USD", locale: string = "en-US"): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(price);
  } catch {
    const rounded = (Math.round(price * 100) / 100).toFixed(2);
    return `$${rounded}`;
  }
}

export function formatCurrency(amount: number, currency: string = "USD", locale: string = "en-US"): string {
  return formatPrice(amount, currency, locale);
}

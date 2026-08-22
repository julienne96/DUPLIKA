import type { Money } from "./types";

export const CURRENCY = "XOF";

/** Formate un montant stocké en frcfa. */
export function formatPrice(value: Money, currency: string = CURRENCY): string {
  const amount = value;
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "XOF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("fr-FR")} ${currency}`;
  }
}

export function discountPercent(price: Money, compareAt?: Money): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

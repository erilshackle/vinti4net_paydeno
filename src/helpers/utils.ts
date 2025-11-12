/**
 * Converte código de moeda ISO (ex: "CVE", "USD") para número ISO-4217.
 */
export function currencyToCode(currency: string): number {
  const map: Record<string, number> = {
    CVE: 132, USD: 840, EUR: 978, BRL: 986, GBP: 826,
    JPY: 392, AUD: 36, CAD: 124, CHF: 756, CNY: 156,
    INR: 356, ZAR: 710, RUB: 643, MXN: 484, KRW: 410, SGD: 702,
  };
  const upper = currency.toUpperCase();
  if (map[upper]) return map[upper];
  if (/^\d+$/.test(currency)) return Number(currency);
  throw new Error(`Invalid currency code: ${currency}`);
}

/**
 * Normaliza dados de faturação (billing) com fallback no campo user.
 */
export function normalizeBilling(billing: Record<string, any>) {
  const user = billing.user ?? {};
  const email = billing.email ?? user.email ?? "";
  const country = billing.billAddrCountry ?? user.country ?? "132";
  const city = billing.billAddrCity ?? user.city ?? "";
  const address = billing.billAddrLine1 ?? user.address ?? "";
  const postCode = billing.billAddrPostCode ?? user.postCode ?? "";
  const mobile = billing.mobilePhone ?? user.mobilePhone ?? "";

  return { email, country, city, address, postCode, mobile };
}
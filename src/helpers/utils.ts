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

/**
 * Processa e valida a resposta vinda do Vinti4Net (via POST).
 *
 * @param postData - Dados recebidos via POST
 * @returns Resultado interpretado
 */
export function processResponse(postData: Record<string, any>) {
  const result = {
    status: "ERROR",
    message: "Erro desconhecido na transação.",
    success: false,
    data: postData,
  };

  if (!postData) {
    result.message = "Nenhum dado recebido.";
    return result;
  }

  if (postData["UserCancelled"] === "true") {
    result.status = "CANCELLED";
    result.message = "Transação cancelada pelo utilizador.";
    return result;
  }

  const responseCode = postData["ResponseCode"];
  const messageType = postData["MessageType"];
  const successTypes = ["8", "10", "P", "M"];

  if (successTypes.includes(messageType) && responseCode === "00") {
    result.status = "SUCCESS";
    result.message = "Pagamento concluído com sucesso.";
    result.success = true;
  } else if (responseCode && responseCode !== "00") {
    result.status = "DECLINED";
    result.message = `Transação recusada. Código: ${responseCode}`;
  } else {
    result.status = "UNKNOWN";
    result.message = "Resposta não reconhecida do gateway.";
  }

  // DCC (Dynamic Currency Conversion)
  const dcc = extractDcc(postData);
  if (dcc) (result as any).dcc = dcc;

  // Debug (opcional)
  (result as any).debug = {
    timestamp: new Date().toISOString(),
    messageType,
    responseCode,
  };

  return result;
}

/**
 * Extrai dados DCC (taxas de conversão, markup etc.) do POST, se existirem.
 */
function extractDcc(postData: Record<string, any>) {
  const dccCurrency = postData["dccCurrency"];
  if (!dccCurrency) return null;

  return {
    currency: dccCurrency,
    rate: postData["dccRate"] ?? null,
    markup: postData["dccMarkup"] ?? null,
    transactionCurrency: postData["dccTransactionCurrency"] ?? null,
  };
}

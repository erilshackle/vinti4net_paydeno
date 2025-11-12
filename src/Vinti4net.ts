// --- imports ---
import type { PaymentResult, BillingInfo, PaymentRequest } from "./types.ts";
import { currencyToCode, normalizeBilling } from "./helpers/utils.ts";
import { sha512Base64 } from "./helpers/crypto.ts";
import { processResponse } from "./response.ts";


export class Vinti4Net {
  static DEFAULT_BASE_URL = "https://mc.vinti4net.cv/BizMPIOnUsSisp/CardPayment";

  static TRANSACTION_TYPE_PURCHASE = "1";
  static TRANSACTION_TYPE_SERVICE  = "2";
  static TRANSACTION_TYPE_RECHARGE = "3";
  static TRANSACTION_TYPE_REFUND   = "4";

  static CURRENCY_CVE = "132";
  static SUCCESS_MESSAGE_TYPES = ["8", "10", "P", "M"];

  private posID: string;
  private posAuthCode: string;
  private baseUrl: string;
  private request: PaymentRequest = {};
  private prepared = false;

  constructor(posID: string, posAuthCode: string, endpoint?: string) {
    this.posID = posID;
    this.posAuthCode = posAuthCode;
    this.baseUrl = endpoint ?? Vinti4Net.DEFAULT_BASE_URL;
  }

  setRequestParams(params: PaymentRequest): this {
    const allowed = [
      "merchantRef", "merchantSession", "languageMessages",
      "entityCode", "referenceNumber", "timeStamp",
      "billing", "currency", "acctID", "acctInfo",
      "addrMatch", "billAddrCountry", "billAddrCity",
      "billAddrLine1", "billAddrPostCode", "email",
      "clearingPeriod",
    ];

    for (const [key, value] of Object.entries(params)) {
      if (!allowed.includes(key)) {
        throw new Error(`Parâmetro não permitido: ${key}`);
      }
      this.request[key] = key === "currency" ? currencyToCode(String(value)) : value;

    }

    return this;
  }

  preparePurchasePayment(amount: number, billing: BillingInfo, currency = "CVE"): this {
    this.preparePaymentRequest({
      amount,
      transactionCode: Vinti4Net.TRANSACTION_TYPE_PURCHASE,
      currency,
      billing,
    });
    return this;
  }

  prepareServicePayment(amount: number, entity: number, number: string): this {
    this.preparePaymentRequest({
      amount,
      transactionCode: Vinti4Net.TRANSACTION_TYPE_SERVICE,
      entityCode: entity,
      referenceNumber: number,
    });
    return this;
  }

  prepareRechargePayment(amount: number, entity: number, number: string): this {
    this.preparePaymentRequest({
      amount,
      transactionCode: Vinti4Net.TRANSACTION_TYPE_RECHARGE,
      entityCode: entity,
      referenceNumber: number,
    });
    return this;
  }

  prepareRefundPayment(
    amount: number,
    merchantRef: string,
    merchantSession: string,
    transactionID: string,
    clearingPeriod: string,
  ): this {
    this.preparePaymentRequest({
      transactionCode: Vinti4Net.TRANSACTION_TYPE_REFUND,
      amount,
      clearingPeriod,
      transactionID,
      merchantRef,
      merchantSession,
    });
    return this;
  }

  async createPaymentForm(responseUrl: string, merchantRef?: string): Promise<string> {
    this.request.urlMerchantResponse = responseUrl;
    if (merchantRef) this.request.merchantRef = merchantRef;

    const paymentData = await this.processRequest(this.request);

    const fields = Object.entries(paymentData.fields)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v)}">`)
      .join("\n");

    return `<!DOCTYPE html>
<html lang="pt">
<head><title>Pagamento Vinti4Net</title></head>
<body onload="document.forms[0].submit()">
<form method="post" action="${paymentData.postUrl}">
${fields}
</form>
<p>Processando...</p>
</body>
</html>`;
  }

  /** Processa a resposta retornada pelo gateway Vinti4Net */
  processResponse(postData: PaymentRequest): PaymentResult {
    return processResponse(postData);
  }

  // -------------------- PRIVADOS --------------------

  private preparePaymentRequest(params: PaymentRequest) {
    if (this.prepared)
      throw new Error("Vinti4Net: apenas 1 pagamento pode ser preparado por instância.");

    this.request = {
      posID: this.posID,
      merchantRef: params.merchantRef ?? `R${this.timestamp()}`,
      merchantSession: params.merchantSession ?? `S${this.timestamp()}`,
      amount: Math.floor(Number(params.amount)),
      currency: currencyToCode(String(params.currency ?? Vinti4Net.CURRENCY_CVE)),
      transactionCode: params.transactionCode ?? Vinti4Net.TRANSACTION_TYPE_PURCHASE,
      languageMessages: params.languageMessages ?? "pt",
      entityCode: params.entityCode ?? "",
      referenceNumber: params.referenceNumber ?? "",
      timeStamp: new Date().toISOString(),
      fingerPrintVersion: "1",
      is3DSec: "1",
      urlMerchantResponse: params.urlMerchantResponse ?? "",
      billing: params.billing ?? {},
    };

    this.prepared = true;
  }

  private async processRequest(fields: PaymentRequest) {
  if (fields.transactionCode === Vinti4Net.TRANSACTION_TYPE_PURCHASE && fields.billing) {
    fields = { ...fields, ...fields.billing } as PaymentRequest;
     // Garante que billing não é undefined antes de gerar a string
    if (fields.billing) {
        fields.purchaseRequest = this.generatePurchaseRequest(fields.billing);
    }
  }

  const type = fields.transactionCode !== Vinti4Net.TRANSACTION_TYPE_REFUND ? "payment" : "refund";
  delete fields.billing;
  fields.fingerprint = await this.fingerprintRequest(fields, type);

  const postUrl = `${this.baseUrl}?${new URLSearchParams({
    FingerPrint: String(fields.fingerprint),
    TimeStamp: String(fields.timeStamp),
    FingerPrintVersion: String(fields.fingerprintversion),
  })}`;

  return { postUrl, fields };
}


  private async fingerprintRequest(data: PaymentRequest, type = "payment"): Promise<string> {
    const encodedPOSAuthCode = await sha512Base64(this.posAuthCode);

    if (type === "payment") {
      const amountLong = Math.floor(Number(data.amount) * 1000);
      const toHash = [
        encodedPOSAuthCode,
        data.timeStamp ?? "",
        amountLong,
        data.merchantRef ?? "",
        data.merchantSession ?? "",
        data.posID ?? "",
        data.currency ?? "",
        data.transactionCode ?? "",
        data.entityCode ?? "",
        data.referenceNumber ?? "",
      ].join("");

      return await sha512Base64(toHash);
    }

    // Refund
    const amountLong = Math.floor(Number(data.amount) * 1000);
    const toHash = [
      encodedPOSAuthCode,
      data.transactionCode ?? "",
      data.posID ?? "",
      data.merchantRef ?? "",
      data.merchantSession ?? "",
      amountLong,
      data.currency ?? "",
      data.clearingPeriod ?? "",
      data.transactionID ?? "",
      data.reversal ?? "",
      data.urlMerchantResponse ?? "",
      data.languageMessages ?? "",
      data.fingerPrintVersion ?? "",
      data.timeStamp ?? "",
    ].join("");

    return await sha512Base64(toHash);
  }

  private timestamp(): string {
    const d = new Date();
    return d.toISOString().replace(/\D/g, "").slice(0, 14);
  }

  private generatePurchaseRequest(billing: BillingInfo): string {
    const normalized = normalizeBilling(billing);
    return JSON.stringify(normalized);
  }
}

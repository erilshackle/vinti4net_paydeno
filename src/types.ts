export type PaymentStatus = "SUCCESS" | "CANCELLED" | "DECLINED" | "ERROR" | "UNKNOWN";

export interface PaymentResult {
  status: PaymentStatus;
  message: string;
  success: boolean;
  data: Record<string, unknown>;
  dcc?: {
    currency: string;
    rate?: string;
    markup?: string;
    transactionCurrency?: string;
  } | null;
  debug?: Record<string, unknown>;
}

export interface BillingInfo {
  user?: {
    email?: string;
    country?: string;
    city?: string;
    phone?: string;
    address?: string;
  };
  email?: string;
  billAddrCountry?: string;
  billAddrCity?: string;
  billAddrLine1?: string;
}

export interface PaymentRequest {
  merchantRef?: string;
  merchantSession?: string;
  languageMessages?: string;
  entityCode?: string | number;
  referenceNumber?: string;
  timeStamp?: string;
  billing?: BillingInfo;
  currency?: string | number;
  acctID?: string;
  acctInfo?: Record<string, unknown>;
  addrMatch?: string;
  billAddrPostCode?: string;
  billAddrLine1?: string;
  billAddrCity?: string;
  billAddrCountry?: string;
  email?: string;
  clearingPeriod?: string;
  transactionID?: string;
  reversal?: string;
  urlMerchantResponse?: string;
  is3DSec?: string;
  fingerprintversion?: string;
  purchaseRequest?: string;
  [key: string]: unknown; // campos extras
}

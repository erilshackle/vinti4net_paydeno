import type { PaymentResult } from "./../types.ts";

const SUCCESS_MESSAGE_TYPES = ["8", "10", "P", "M"];

export function processResponse(postData: Record<string, any>): PaymentResult {
  const result: PaymentResult = {
    status: "ERROR",
    message: "Erro desconhecido na transação.",
    success: false,
    data: postData,
  };

  if (!postData || Object.keys(postData).length === 0) {
    result.message = "Nenhum dado recebido.";
    return result;
  }

  // Cancelamento manual
  if (postData["UserCancelled"] === "true") {
    result.status = "CANCELLED";
    result.message = "Transação cancelada pelo utilizador.";
    return result;
  }

  const responseCode = postData["ResponseCode"];
  const messageType = postData["MessageType"];

  // Sucesso
  if (SUCCESS_MESSAGE_TYPES.includes(messageType) && responseCode === "00") {
    result.status = "SUCCESS";
    result.message = "Pagamento concluído com sucesso.";
    result.success = true;
  }
  // Falha
  else if (responseCode && responseCode !== "00") {
    result.status = "DECLINED";
    result.message = `Transação recusada. Código: ${responseCode}`;
  }
  // Indefinido
  else {
    result.status = "UNKNOWN";
    result.message = "Resposta não reconhecida do gateway.";
  }

  // Dados DCC
  const dcc = extractDcc(postData);
  if (dcc) result.dcc = dcc;

  result.debug = {
    timestamp: new Date().toISOString(),
    messageType,
    responseCode,
    merchantRef: postData["MerchantRef"],
    merchantSession: postData["MerchantSession"],
  };

  return result;
}

function extractDcc(postData: Record<string, any>) {
  const currency = postData["dccCurrency"];
  if (!currency) return null;

  return {
    currency,
    rate: postData["dccRate"] ?? undefined,
    markup: postData["dccMarkup"] ?? undefined,
    transactionCurrency: postData["dccTransactionCurrency"] ?? undefined,
  };
}

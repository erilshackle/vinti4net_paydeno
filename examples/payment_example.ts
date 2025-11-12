/**
 * Exemplo de uso do Vinti4Net Deno SDK
 * Demonstrando pagamento de compra simples
 */

import { Vinti4Net, BillingInfo } from "https://deno.land/x/vinti4net_paydeno/mod.ts";

async function main() {
  // Configuração do POS
  const posID = "POS123";
  const posAuthCode = "AUTH456";

  const client = new Vinti4Net(posID, posAuthCode);

  // Informações de cobrança
  const billing: BillingInfo = {
    email: "cliente@exemplo.com",
    billAddrCountry: "132", // CVE
    billAddrCity: "Praia",
    billAddrLine1: "Rua Exemplo, 123",
  };

  // Preparar pagamento de compra
  client.preparePurchasePayment(1000, billing);

  // Gerar formulário HTML para redirecionamento
  const responseUrl = "https://meusite.cv/response";
  const htmlForm = await client.createPaymentForm(responseUrl);

  console.log("Formulário HTML gerado:");
  console.log(htmlForm);

  // Simulação de resposta (exemplo)
  const fakeResponse = {
    status: "8",
    merchantRef: "R20251111010101",
    amount: 1000,
    currency: "132",
  };

  const result = client.processResponse(fakeResponse);

  console.log("\nResultado do pagamento processado:");
  console.log(result);
}

main().catch(console.error);

import { assertEquals, assert } from "https://deno.land/std@0.216.0/testing/asserts.ts";
import { Vinti4Net, type PaymentResult } from "../mod.ts";

// Cria um cliente Vinti4Net de teste
const client = new Vinti4Net("TESTPOSID", "TESTAUTHCODE");

// Billing de exemplo
const billing = {
  billAddrCountry: "132",
  billAddrCity: "Praia",
  billAddrLine1: "Rua Teste",
  email: "user@test.com",
  billAddrPostCode: "7600"
};

// Teste: preparar pagamento de compra
Deno.test("preparePurchasePayment", () => {
  client.preparePurchasePayment(1500, billing, "CVE");
  
  const request = (client as any).request; // acessar privado só para teste
  assertEquals(request.amount, 1500);
  assertEquals(request.currency, 132);
  assertEquals(request.billing.email, "user@test.com");
  assert(request.posID === "TESTPOSID");
});

// Teste: gerar purchaseRequest
Deno.test("generatePurchaseRequest", () => {
  const normalized = (client as any).generatePurchaseRequest(billing);
  const parsed = JSON.parse(normalized);
  
  assertEquals(parsed.email, "user@test.com");
  assertEquals(parsed.country, "132");
  assertEquals(parsed.city, "Praia");
  assertEquals(parsed.address, "Rua Teste");
});


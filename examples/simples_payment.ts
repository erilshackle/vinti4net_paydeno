import { Vinti4Net } from "../src/Vinti4net.ts";

const client = new Vinti4Net("POS123", "AUTH456");

client.preparePurchasePayment(1000, {
  email: "cliente@exemplo.com",
  billAddrCountry: "132",
  billAddrCity: "Praia",
  billAddrLine1: "Rua Exemplo, 123"
});

const htmlForm = await client.createPaymentForm("https://meusite.cv/response");
console.log(htmlForm);

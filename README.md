# Vinti4Net Deno SDK

SDK Deno para integração com o sistema de pagamentos **Vinti4Net** (SISP Cabo Verde).  
Permite criar pagamentos de compra, serviços, recargas e reembolsos de forma simples.

---

## Instalação

Importe direto pelo Deno:

```ts
import { Vinti4Net, PaymentRequest, PaymentResult } from "https://deno.land/x/vinti4net_deno/mod.ts";
```

---

## Uso

```ts
import { Vinti4Net } from "https://deno.land/x/vinti4net_deno/mod.ts";

const client = new Vinti4Net("POS123", "AUTH456");

// Preparar pagamento de compra
client.preparePurchasePayment(1000, {
  email: "cliente@exemplo.com",
  billAddrCountry: "132",
  billAddrCity: "Praia",
  billAddrLine1: "Rua Exemplo, 123"
});

// Gerar formulário HTML para redirecionamento
const html = await client.createPaymentForm("https://meusite.cv/response");

console.log(html);
```

---

## API

* `preparePurchasePayment(amount: number, billing: BillingInfo, currency?: string)`
* `prepareServicePayment(amount: number, entity: number, number: string)`
* `prepareRechargePayment(amount: number, entity: number, number: string)`
* `prepareRefundPayment(amount: number, merchantRef: string, merchantSession: string, transactionID: string, clearingPeriod: string)`
* `createPaymentForm(responseUrl: string, merchantRef?: string): Promise<string>`
* `processResponse(postData: Record<string, unknown>): PaymentResult`

---

## Tipos

* `PaymentRequest` - dados para preparar um pagamento
* `PaymentResult` - retorno do gateway
* `BillingInfo` - informações do cliente
* `PaymentStatus` - `"SUCCESS" | "CANCELLED" | "DECLINED" | "ERROR" | "UNKNOWN"`

---

## Contribuição

1. Faça um fork
2. Crie uma branch com sua feature (`git checkout -b feature/foo`)
3. Commit suas alterações (`git commit -am 'Add foo'`)
4. Push para a branch (`git push origin feature/foo`)
5. Abra um Pull Request

---

## Licença

MIT © Eril TS Carvalho
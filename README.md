# Vinti4Net Pay Deno - Payment SDK

[![deno.land/x](https://img.shields.io/badge/deno.land-x.vinti4net_paydeno-blue?logo=deno&style=flat-square)](https://deno.land/x/vinti4net_paydeno)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)  
[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](https://deno.land/x/vinti4net_paydeno)  

SDK Deno para integração com o sistema de pagamentos **Vinti4Net** (SISP Cabo Verde).  
Permite criar pagamentos de compra, serviços, recargas e reembolsos de forma simples, com suporte a processamento de respostas do gateway.

---

## Instalação

Importe direto pelo Deno:

```ts
import { Vinti4Net, PaymentRequest, PaymentResult } from "https://deno.land/x/vinti4net_paydeno/mod.ts";
```

---

## Exemplo de Uso

```ts
import { Vinti4Net, BillingInfo } from "https://deno.land/x/vinti4net_paydeno/mod.ts";

const client = new Vinti4Net("POS123", "AUTH456");

// Preparar pagamento de compra
const request: PaymentRequest = {
  amount: 1000,
  billing: {
    email: "cliente@exemplo.com",
    billAddrCountry: "132",
    billAddrCity: "Praia",
    billAddrLine1: "Rua Exemplo, 123",
  }
};
client.preparePurchasePayment(request.amount, request.billing);


// Gerar formulário HTML para redirecionamento
const html = await client.createPaymentForm("https://meusite.cv/response");

console.log(html);
```

---

## Processando Resposta do Gateway

Ao receber a resposta POST do gateway, use `processResponse` para interpretar o resultado:

```ts
import { Vinti4Net } from "https://deno.land/x/vinti4net_paydeno/mod.ts";

const client = new Vinti4Net("POS123", "AUTH456");

// postData é o corpo recebido do gateway via POST
const result = client.processResponse(postData);

if(result.success){
  console.log("Pagamento aprovado:", result.status, result.message);
} else {
  console.log("Pagamento falhou:", result.status, result.message);
}
```

O retorno é um objeto `PaymentResult`:

```ts
interface PaymentResult {
  status: "SUCCESS" | "CANCELLED" | "DECLINED" | "ERROR" | "UNKNOWN";
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

* `PaymentRequest` - dados usados para preparar um pagamento
* `PaymentResult` - retorno do gateway após a transação
* `BillingInfo` - informações do cliente para faturamento
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
// src/billing.ts

export function normalizeBilling(billing: Record<string, any>) {
  const user = billing.user ?? {};
  delete billing.user;

  const get = (src: any, key: string, def: any = null) => src[key] ?? def;
  const extractCC = (phone: string, def = "238") => {
    const m = phone.replace(/\D/g, "").match(/^(?:00|\+)?(\d{1,3})/);
    return m ? m[1] : def;
  };

  const email = billing.email ?? get(user, "email");
  const country = billing.billAddrCountry ?? get(user, "country", "132");

  return {
    email,
    billAddrCountry: country,
    billAddrCity: billing.billAddrCity ?? get(user, "city", ""),
    billAddrLine1: billing.billAddrLine1 ?? get(user, "address", ""),
    billAddrPostCode: billing.billAddrPostCode ?? get(user, "postCode", ""),
    mobilePhone: billing.mobilePhone ?? get(user, "mobilePhone"),
    acctID: get(user, "id", ""),
  };
}

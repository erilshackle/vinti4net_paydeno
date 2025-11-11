// ✅ usa Web Crypto nativo do Deno (sem dependência do Node)
export async function sha512Base64(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-512", data);
  const bytes = new Uint8Array(hash);
  const bin = String.fromCharCode(...bytes);
  return btoa(bin);
}

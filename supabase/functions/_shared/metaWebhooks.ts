function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyMetaSignature(opts: {
  appSecret: string;
  rawBody: ArrayBuffer;
  signatureHeader: string | null;
}): Promise<boolean> {
  const { appSecret, rawBody, signatureHeader } = opts;

  if (!signatureHeader) return false;
  const [algo, theirHex] = signatureHeader.split("=", 2);
  if (algo !== "sha256" || !theirHex) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, rawBody);
  const ourHex = toHex(new Uint8Array(sig));

  return timingSafeEqual(ourHex, theirHex);
}

export function parseMetaVerifyQuery(url: URL): {
  mode: string | null;
  verifyToken: string | null;
  challenge: string | null;
} {
  return {
    mode: url.searchParams.get("hub.mode"),
    verifyToken: url.searchParams.get("hub.verify_token"),
    challenge: url.searchParams.get("hub.challenge"),
  };
}


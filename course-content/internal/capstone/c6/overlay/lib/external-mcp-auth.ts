import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const mcpProtocolVersion = "2026-07-28";
export const mcpAudience = "ai-research-external";
export const mcpScope = "tools:call:search_external_references";
export const mcpTokenTtlMs = 2 * 60 * 1000;
const payloadSchema = z.strictObject({
  v: z.literal(1), aud: z.literal(mcpAudience), scope: z.literal(mcpScope),
  exp: z.number().int().positive(), nonce: z.string().regex(/^[A-Za-z0-9_-]{22,64}$/),
});

function secretBytes(secret: string) {
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32)
    throw new Error("MCP_AUTH_NOT_CONFIGURED");
  return Buffer.from(secret, "utf8");
}

export function configuredMcpUrl(value: string | undefined, production = process.env.NODE_ENV === "production") {
  if (!value) throw new Error("MCP_URL_NOT_CONFIGURED");
  let url: URL;
  try { url = new URL(value); } catch { throw new Error("MCP_URL_INVALID"); }
  if (url.username || url.password || url.hash || url.search || url.pathname !== "/api/mcp/external-research")
    throw new Error("MCP_URL_INVALID");
  const localHttp = url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname) &&
    (!production || process.env.MCP_ALLOW_LOCAL_HTTP === "1");
  if (url.protocol !== "https:" && !localHttp)
    throw new Error("MCP_URL_INVALID");
  return url;
}

export function issueMcpBearer(secret: string, now = Date.now()) {
  const key = secretBytes(secret);
  const payload = payloadSchema.parse({ v: 1, aud: mcpAudience, scope: mcpScope,
    exp: now + mcpTokenTtlMs, nonce: randomBytes(24).toString("base64url") });
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", key).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyMcpBearer(header: string | null, secret: string, now = Date.now()) {
  const key = secretBytes(secret);
  if (!header?.startsWith("Bearer ")) throw new Error("MCP_UNAUTHORIZED");
  const token = header.slice(7);
  if (token.length > 2048 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token))
    throw new Error("MCP_UNAUTHORIZED");
  const [encoded, signature] = token.split(".");
  const expected = createHmac("sha256", key).update(encoded).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error("MCP_UNAUTHORIZED");
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); }
  catch { throw new Error("MCP_UNAUTHORIZED"); }
  const payload = payloadSchema.safeParse(parsed);
  if (!payload.success || payload.data.exp <= now) throw new Error("MCP_UNAUTHORIZED");
  return true;
}

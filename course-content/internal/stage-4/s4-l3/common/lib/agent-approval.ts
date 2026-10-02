import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { saveResearchNoteSchema, type SaveResearchNoteArgs } from "./agent-tools";

export const approvalTtlMs = 5 * 60 * 1000;
const payloadSchema = z.strictObject({
  v: z.literal(1),
  userId: z.number().int().positive(),
  toolName: z.literal("save_research_note"),
  canonicalArgs: z.string().min(1).max(1024),
  expiresAt: z.number().int().positive(),
  nonce: z.string().regex(/^[A-Za-z0-9_-]{22,64}$/),
});

export function canonicalizeSaveResearchNoteArgs(input: unknown): string {
  const parsed = saveResearchNoteSchema.parse(input);
  return JSON.stringify({ title: parsed.title, content: parsed.content });
}

function secretBytes(secret: string): Buffer {
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32)
    throw new Error("APPROVAL_SECRET_NOT_CONFIGURED");
  return Buffer.from(secret, "utf8");
}

export function issueApprovalToken(input: {
  userId: number; args: SaveResearchNoteArgs; secret: string; now?: () => number;
}): string {
  const key = secretBytes(input.secret);
  const payload = payloadSchema.parse({
    v: 1, userId: input.userId, toolName: "save_research_note",
    canonicalArgs: canonicalizeSaveResearchNoteArgs(input.args),
    expiresAt: (input.now?.() ?? Date.now()) + approvalTtlMs,
    nonce: randomBytes(24).toString("base64url"),
  });
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", key).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyApprovalToken(input: {
  token: string; userId: number; secret: string; now?: () => number;
}): SaveResearchNoteArgs {
  const key = secretBytes(input.secret);
  if (typeof input.token !== "string" || input.token.length > 4096 ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.token)) throw new Error("INVALID_APPROVAL_TOKEN");
  const [encoded, supplied] = input.token.split(".");
  const expected = createHmac("sha256", key).update(encoded).digest();
  const suppliedBytes = Buffer.from(supplied, "base64url");
  if (suppliedBytes.length !== expected.length || !timingSafeEqual(suppliedBytes, expected))
    throw new Error("INVALID_APPROVAL_TOKEN");
  let raw: unknown;
  try { raw = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); }
  catch { throw new Error("INVALID_APPROVAL_TOKEN"); }
  const payload = payloadSchema.safeParse(raw);
  if (!payload.success || payload.data.userId !== input.userId ||
      payload.data.expiresAt <= (input.now?.() ?? Date.now())) throw new Error("INVALID_APPROVAL_TOKEN");
  let args: unknown;
  try { args = JSON.parse(payload.data.canonicalArgs); }
  catch { throw new Error("INVALID_APPROVAL_TOKEN"); }
  const parsed = saveResearchNoteSchema.safeParse(args);
  if (!parsed.success || canonicalizeSaveResearchNoteArgs(parsed.data) !== payload.data.canonicalArgs)
    throw new Error("INVALID_APPROVAL_TOKEN");
  return parsed.data;
}

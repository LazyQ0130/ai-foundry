import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { canonicalizeSaveResearchNoteArgs } from "./agent-approval";

export const approvalV2TtlMs = 5 * 60 * 1000;
const payloadSchema = z.strictObject({
  v: z.literal(2), userId: z.number().int().positive(),
  runId: z.string().min(1).max(128), actionId: z.string().min(1).max(128),
  toolName: z.literal("save_research_note"),
  canonicalArgs: z.string().min(1).max(1024),
  expiresAt: z.number().int().positive(),
  nonce: z.string().regex(/^[A-Za-z0-9_-]{22,64}$/),
});

function key(secret: string) {
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32)
    throw new Error("APPROVAL_SECRET_NOT_CONFIGURED");
  return Buffer.from(secret, "utf8");
}

export function issueApprovalV2(input: { userId: number; runId: string; actionId: string;
  canonicalArgs: string; secret: string; now?: () => number }) {
  const payload = payloadSchema.parse({ v: 2, userId: input.userId, runId: input.runId,
    actionId: input.actionId, toolName: "save_research_note",
    canonicalArgs: input.canonicalArgs, expiresAt: (input.now?.() ?? Date.now()) + approvalV2TtlMs,
    nonce: randomBytes(24).toString("base64url") });
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${createHmac("sha256", key(input.secret)).update(encoded).digest("base64url")}`;
}

export function verifyApprovalV2(input: { token: string; userId: number; secret: string; now?: () => number }) {
  if (typeof input.token !== "string" || input.token.length > 4096 ||
      !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.token)) throw new Error("INVALID_APPROVAL_TOKEN");
  const [encoded, signature] = input.token.split(".");
  const expected = createHmac("sha256", key(input.secret)).update(encoded).digest();
  const supplied = Buffer.from(signature, "base64url");
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied))
    throw new Error("INVALID_APPROVAL_TOKEN");
  let raw: unknown;
  try { raw = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")); }
  catch { throw new Error("INVALID_APPROVAL_TOKEN"); }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success || parsed.data.userId !== input.userId ||
      parsed.data.expiresAt <= (input.now?.() ?? Date.now())) throw new Error("INVALID_APPROVAL_TOKEN");
  let args: unknown;
  try { args = JSON.parse(parsed.data.canonicalArgs); }
  catch { throw new Error("INVALID_APPROVAL_TOKEN"); }
  try {
    if (canonicalizeSaveResearchNoteArgs(args) !== parsed.data.canonicalArgs)
      throw new Error("INVALID_APPROVAL_TOKEN");
  } catch { throw new Error("INVALID_APPROVAL_TOKEN"); }
  return parsed.data;
}

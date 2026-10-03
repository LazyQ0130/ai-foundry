import { createHash } from "node:crypto";

export function agentActionKey(runId: string, stepId: string, toolName: "save_research_note", canonicalArgs: string) {
  if (!runId || !stepId || !canonicalArgs) throw new Error("INVALID_ACTION_KEY_INPUT");
  return createHash("sha256").update(JSON.stringify([runId, stepId, toolName, canonicalArgs])).digest("hex");
}

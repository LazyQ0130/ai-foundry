import "server-only";

export type AiUsage = { promptTokens: number; completionTokens: number; totalTokens: number };
export type AiAnswer = { kind: "mock" | "real"; text: string; usage: AiUsage | null };

export class AiProviderError extends Error {
  constructor(readonly code: "CONFIG" | "TIMEOUT" | "UNAUTHORIZED" | "UPSTREAM" | "OUTPUT_TRUNCATED") {
    super(code);
  }
}

export function timeoutMs(value = process.env.AI_TIMEOUT_MS): number {
  const number = Number(value ?? "20000");
  if (!Number.isInteger(number) || number < 1000 || number > 30000) throw new AiProviderError("CONFIG");
  return number;
}

export function providerMode(value = process.env.AI_PROVIDER_MODE): "mock" | "real" {
  if (value === undefined || value === "mock") return "mock";
  if (value === "real") return "real";
  throw new AiProviderError("CONFIG");
}

function realConfig() {
  const base = process.env.AI_CHAT_BASE_URL;
  const key = process.env.AI_CHAT_API_KEY;
  const model = process.env.AI_CHAT_MODEL;
  if (!base || !key || !model) throw new AiProviderError("CONFIG");
  let url: URL;
  try { url = new URL(base); } catch { throw new AiProviderError("CONFIG"); }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new AiProviderError("CONFIG");
  }
  if (url.username || url.password || url.search || url.hash) throw new AiProviderError("CONFIG");
  return { base: base.replace(/\/$/, ""), key, model };
}

function usageOf(value: unknown): AiUsage | null {
  if (!value || typeof value !== "object") return null;
  const usage = value as Record<string, unknown>;
  const numbers = [usage.prompt_tokens, usage.completion_tokens, usage.total_tokens];
  if (!numbers.every((item) => typeof item === "number" && Number.isSafeInteger(item) && item >= 0)) return null;
  return { promptTokens: numbers[0] as number, completionTokens: numbers[1] as number, totalTokens: numbers[2] as number };
}

/** The same generate contract is used by Mock and Real. No browser import is allowed. */
export async function generate(input: string, options: { structured?: boolean } = {}): Promise<AiAnswer> {
  const structured = options.structured === true;
  if (typeof input !== "string" || !input.trim() || input.trim().length > (structured ? 4000 : 2000)) throw new AiProviderError("UPSTREAM");
  const prompt = input.trim();
  if (providerMode() === "mock") return structured
    ? { kind: "mock", text: JSON.stringify({ summary: "这是 Mock 模式的结构化建议。", tags: ["Mock", "示例"], confidence: 0.8 }), usage: null }
    : { kind: "mock", text: `MOCK：已收到问题「${prompt.slice(0, 40)}」。这里是固定示例回答，尚未调用真实模型。`, usage: null };

  const { base, key, model } = realConfig();
  const timeout = timeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
        ...(structured ? { response_format: { type: "json_object" } } : {}),
        ...(model === "qwen3.7-flash" && process.env.AI_CHAT_DISABLE_THINKING === "1" ? { enable_thinking: false } : {}),
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw new AiProviderError(response.status === 401 ? "UNAUTHORIZED" : "UPSTREAM");
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") throw new AiProviderError("UPSTREAM");
    const body = data as Record<string, unknown>;
    const choices = body.choices;
    const first = Array.isArray(choices) ? choices[0] : null;
    if (structured && first && typeof first === "object" && (first as Record<string, unknown>).finish_reason === "length") throw new AiProviderError("OUTPUT_TRUNCATED");
    const message = first && typeof first === "object" ? (first as Record<string, unknown>).message : null;
    const content = message && typeof message === "object" ? (message as Record<string, unknown>).content : null;
    if (typeof content !== "string" || !content.trim()) throw new AiProviderError("UPSTREAM");
    return { kind: "real", text: content.slice(0, 4000), usage: usageOf(body.usage) };
  } catch (error) {
    if (controller.signal.aborted) throw new AiProviderError("TIMEOUT");
    if (error instanceof AiProviderError) throw error;
    throw new AiProviderError("UPSTREAM");
  } finally {
    clearTimeout(timer);
  }
}

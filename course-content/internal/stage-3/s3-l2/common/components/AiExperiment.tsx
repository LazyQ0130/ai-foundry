"use client";

import { useRef, useState, type FormEvent } from "react";

type Answer = { kind: "mock" | "real"; text: string; usage: { totalTokens: number } | null };
type View = { kind: "idle" | "loading" } | { kind: "success"; answer: Answer } | { kind: "error"; message: string };

export default function AiExperiment() {
  const [input, setInput] = useState("");
  const [view, setView] = useState<View>({ kind: "idle" });
  const busy = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const prompt = input.trim();
    if (!prompt || prompt.length > 2000) {
      setView({ kind: "error", message: "请输入 1～2000 个字符的问题。" });
      return;
    }
    busy.current = true;
    setView({ kind: "loading" });
    try {
      const response = await fetch("/api/ai/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: prompt }),
      });
      const data: unknown = await response.json();
      if (!data || typeof data !== "object") throw new Error("服务端回复格式不正确。");
      const result = data as Record<string, unknown>;
      if (!response.ok) {
        setView({ kind: "error", message: typeof result.error === "string" ? result.error : `请求失败（HTTP ${response.status}）。` });
        return;
      }
      if ((result.kind !== "mock" && result.kind !== "real") || typeof result.text !== "string" || !result.text.trim()) throw new Error("服务端回复格式不正确。");
      const usage = result.usage && typeof result.usage === "object" && typeof (result.usage as Record<string, unknown>).totalTokens === "number"
        ? { totalTokens: (result.usage as { totalTokens: number }).totalTokens } : null;
      setView({ kind: "success", answer: { kind: result.kind, text: result.text, usage } });
    } catch {
      setView({ kind: "error", message: "无法获得回答，请检查连接后重试。" });
    } finally {
      busy.current = false;
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 sm:p-6" aria-labelledby="ai-experiment-title">
      <h2 id="ai-experiment-title" className="text-lg font-semibold text-stone-900">AI 试验区</h2>
      <p className="mt-1 text-sm text-stone-600">先登录，再提一个简短问题。页面只显示回答与可获得的用量。</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <label htmlFor="ai-question" className="block text-sm font-medium text-stone-700">你的问题</label>
        <textarea id="ai-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000}
          placeholder="用两句话解释为什么 Git 能帮助我在代码改坏后恢复。"
          className="min-h-24 w-full rounded-lg border border-stone-300 bg-white p-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-stone-500">{input.length}/2000 字符</span>
          <button type="submit" disabled={view.kind === "loading"} className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
            {view.kind === "loading" ? "正在询问…" : "询问 AI"}
          </button>
        </div>
      </form>
      <div aria-live="polite" className="mt-4 text-sm">
        {view.kind === "loading" && <p className="text-stone-600">正在等待回答…</p>}
        {view.kind === "error" && <p role="alert" className="text-rose-700">{view.message}</p>}
        {view.kind === "success" && <div className="rounded-lg border border-stone-200 bg-white p-4">
          <p className="font-semibold text-violet-800">{view.answer.kind === "mock" ? "Mock 模式 · 未调用真实模型" : "真实模型"}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-stone-800">{view.answer.text}</p>
          {view.answer.usage && <p className="mt-3 text-xs text-stone-500">Total tokens：{view.answer.usage.totalTokens}</p>}
        </div>}
      </div>
    </section>
  );
}

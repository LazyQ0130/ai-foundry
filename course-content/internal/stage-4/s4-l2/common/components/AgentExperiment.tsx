"use client";

import { useRef, useState } from "react";

type Result = { status: string; answer?: string; error?: string; modelCalls: number; toolCalls: number;
  embeddingCalls: number; providerUnits: number; trace: string[];
  searchMatches?: Array<{ title: string; position: number; preview: string; similarity: number }> };
const examples = [
  ["direct", "直答演示"], ["tool", "Tool 演示"], ["unknown_tool", "故障：未知工具"],
  ["bad_json", "故障：坏 JSON"], ["extra_field", "故障：多余字段"],
  ["multiple_tools", "故障：多个工具"], ["max_steps", "故障：步骤上限"],
  ["max_tools", "故障：工具上限"], ["budget_exhausted", "故障：预算不足"],
  ["provider_error", "故障：模型服务"], ["cancel", "取消演示（运行后点取消）"],
  ["knowledge_search", "4.2：搜索我的知识库"],
  ["knowledge_owner_spoof", "4.2 故障：伪造 ownerId"],
  ["knowledge_budget_embedding", "4.2 故障：Embedding 预算"],
  ["knowledge_budget_final", "4.2 故障：最终模型预算"],
] as const;

export default function AgentExperiment() {
  const [goal, setGoal] = useState("Git 为什么适合保存代码版本");
  const [demo, setDemo] = useState<(typeof examples)[number][0]>("direct");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null);

  async function run() {
    if (pending || !goal.trim()) return;
    const abort = new AbortController();
    controller.current = abort;
    setPending(true); setResult(null); setNotice("");
    try {
      const response = await fetch("/api/agent/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goal.trim(), demo }), signal: abort.signal,
      });
      const data = await response.json();
      if (!response.ok) { setNotice(data.error ?? "请求未完成，请稍后重试。"); return; }
      setResult(data as Result);
    } catch {
      setNotice(abort.signal.aborted ? "已取消。不会再启动新的模型或工具步骤。" : "网络连接失败，请稍后重试。");
    } finally { controller.current = null; setPending(false); }
  }

  return (
    <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-label="Agent 实验区">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="text-lg font-semibold text-stone-900">受限 Agent 实验</h2>
          <p className="mt-1 text-sm text-stone-600">选择知识搜索时，模型给出 query，服务端只检索当前登录用户的文档。</p></div>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-amber-800">4.2 · 我的知识库</span>
      </div>
      <label className="mt-5 block text-sm font-medium text-stone-700">研究目标
        <input value={goal} onChange={event => setGoal(event.target.value)} maxLength={2000}
          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-amber-500"
          placeholder="输入一个短研究主题" />
      </label>
      <label className="mt-4 block text-sm font-medium text-stone-700">观察路径
        <select value={demo} onChange={event => setDemo(event.target.value as typeof demo)}
          className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 sm:max-w-xs">
          {examples.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={run} disabled={pending || !goal.trim()}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{pending ? "运行中…" : "运行 Agent"}</button>
        <button type="button" onClick={() => controller.current?.abort()} disabled={!pending}
          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 disabled:opacity-50">取消</button>
      </div>
      {notice && <p role="status" className="mt-4 text-sm text-rose-700">{notice}</p>}
      {result && <div className="mt-5 rounded-xl border border-amber-100 bg-white p-4" role="status">
        <p className="text-sm font-semibold text-stone-900">终态：{result.status}</p>
        <p className="mt-1 text-xs text-stone-500">模型调用 {result.modelCalls} 次 · Embedding {result.embeddingCalls} 次 · 工具执行 {result.toolCalls} 次 · 本次 Provider 单位 {result.providerUnits}</p>
        <p className="mt-1 text-xs text-stone-500">search_knowledge：{result.searchMatches ? "已执行" : "未执行"}</p>
        {result.searchMatches && <div className="mt-3 space-y-2" aria-label="我的知识库安全摘要">
          {result.searchMatches.length === 0 && <p className="text-sm text-stone-600">没有匹配资料（matches=[]）。</p>}
          {result.searchMatches.map((match, index) => <div key={index} className="rounded-lg border border-stone-200 p-3">
            <p className="text-sm font-medium text-stone-900">{match.title}</p>
            <p className="mt-1 text-xs text-stone-500">位置 {match.position} · 相似度 {match.similarity}</p>
            <p className="mt-1 text-sm text-stone-700">{match.preview}</p>
          </div>)}
        </div>}
        {result.answer && <p className="mt-3 text-sm text-stone-800">{result.answer}</p>}
        {result.error && <p className="mt-3 text-sm text-rose-700">受控拒绝：{result.error}</p>}
        <ol className="mt-3 list-inside list-decimal space-y-1 text-xs text-stone-600">
          {result.trace.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </div>}
      <p className="mt-4 text-xs text-stone-500">模型只能提出动作；真正执行工具的是服务端。真实模式由模型自行选择直答或工具。</p>
    </section>
  );
}

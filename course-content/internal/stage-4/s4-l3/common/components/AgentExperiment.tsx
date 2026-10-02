"use client";

import { useRef, useState } from "react";

type Result = { status: string; answer?: string; error?: string; modelCalls: number; toolCalls: number;
  embeddingCalls: number; providerUnits: number; trace: string[];
  proposal?: { toolName: "save_research_note"; args: { title: string; content: string } }; approvalToken?: string;
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
  ["note_proposal", "4.3：提议保存研究笔记"],
  ["note_extra_field", "4.3 故障：多余写入参数"],
  ["note_unknown_tool", "4.3 故障：未知写工具"],
] as const;

export default function AgentExperiment() {
  const [goal, setGoal] = useState("Git 为什么适合保存代码版本");
  const [demo, setDemo] = useState<(typeof examples)[number][0]>("direct");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null);

  async function confirm() {
    if (pending || !result?.approvalToken || result.status !== "waiting_approval") return;
    setPending(true); setNotice("");
    try {
      const response = await fetch("/api/agent/confirm", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalToken: result.approvalToken }) });
      const data = await response.json();
      if (!response.ok) { setNotice(data.error ?? "确认失败。"); return; }
      setResult(previous => previous ? { ...previous, status: "saved", proposal: undefined, approvalToken: undefined } : null);
      setNotice(`已保存：${data.saved.title}。确认过程没有再次调用模型。`);
    } catch { setNotice("确认请求失败，请稍后重试。"); }
    finally { setPending(false); }
  }

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
          <p className="mt-1 text-sm text-stone-600">写入只会先生成提议；请看清标题和内容，再决定是否保存。</p></div>
        <span className="rounded-full bg-white px-3 py-1 text-xs text-amber-800">4.3 · 人工确认</span>
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
        {result.status === "waiting_approval" && result.proposal && result.approvalToken && <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4" aria-label="待确认的研究笔记">
          <p className="text-sm font-semibold text-stone-900">AI 想保存一条研究笔记；目前还没有写入数据库</p>
          <p className="mt-3 text-xs font-medium text-stone-600">标题</p>
          <p className="whitespace-pre-wrap break-words text-sm text-stone-900">{result.proposal.args.title}</p>
          <p className="mt-3 text-xs font-medium text-stone-600">内容</p>
          <p className="whitespace-pre-wrap break-words text-sm text-stone-900">{result.proposal.args.content}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={confirm} disabled={pending} className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-white disabled:opacity-50">确认保存</button>
            <button type="button" onClick={() => { setResult(null); setNotice("已取消提议，没有保存。"); }} disabled={pending} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 disabled:opacity-50">取消提议</button>
          </div>
        </div>}
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
      <p className="mt-4 text-xs text-stone-500">模型只能提出写入；用户确认后服务端才保存。按钮禁用只防误触，不能防止同一有效凭证重放。</p>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

type RunView = { id: string; goal: string; status: string; currentStep: number;
  timeline: Array<{ id: string; position: number; kind: string; label: string; status: string;
    toolName?: string | null; errorCategory?: string | null }>;
  proposal?: { title: string; content: string; approvalToken: string };
  saved?: { id: number; title: string; desc: string; tag: string } };
const storageKey = "aifoundry-stage4-l6-recent-run";

export default function PersistedRunLab() {
  const [goal, setGoal] = useState("请根据我自己的 Git 恢复版本资料整理研究笔记，保存前让我确认。");
  const [demo, setDemo] = useState("research_workflow");
  const [view, setView] = useState<RunView | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [lastToken, setLastToken] = useState("");

  async function load(id: string) {
    setPending(true); setNotice("");
    try {
      const response = await fetch(`/api/agent/runs/${encodeURIComponent(id)}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) { setNotice(body.error ?? "Run 无法读取。"); setView(null); return; }
      setView(body as RunView);
    } catch { setNotice("读取 Run 失败，请稍后重试。"); }
    finally { setPending(false); }
  }

  useEffect(() => { const id = localStorage.getItem(storageKey); if (id) void load(id); }, []);

  async function start() {
    if (pending || !goal.trim()) return;
    setPending(true); setNotice(""); setLastToken("");
    try {
      const response = await fetch("/api/agent/runs", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: goal.trim(), demo }) });
      const body = await response.json();
      if (!response.ok) { setNotice(body.error ?? "Run 创建失败。"); return; }
      const next = body as RunView;
      localStorage.setItem(storageKey, next.id);
      setView(next);
    } catch { setNotice("Run 请求失败，请稍后重试。"); }
    finally { setPending(false); }
  }

  async function resume() {
    if (pending || !view || view.status !== "paused") return;
    setPending(true); setNotice("");
    try {
      const response = await fetch(`/api/agent/runs/${encodeURIComponent(view.id)}/resume`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const body = await response.json();
      if (!response.ok) { setNotice(body.error ?? "Resume 失败。"); return; }
      setView(body as RunView);
      setNotice("已从安全检查点重新执行只读阶段。");
    } catch { setNotice("Resume 请求失败。"); }
    finally { setPending(false); }
  }

  async function confirm(token: string, repeated = false) {
    if (pending || !view) return;
    setPending(true); setNotice("");
    try {
      const response = await fetch("/api/agent/confirm", { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approvalToken: token }) });
      const body = await response.json();
      if (!response.ok) { setNotice(body.error ?? "确认失败。"); return; }
      if (!repeated) setLastToken(token);
      setNotice(body.message ?? "确认完成。");
      const refreshed = await fetch(`/api/agent/runs/${encodeURIComponent(view.id)}`, { cache: "no-store" });
      if (refreshed.ok) setView(await refreshed.json() as RunView);
    } catch { setNotice("确认请求失败，可用同一凭证重试，数据库会返回已有结果。"); }
    finally { setPending(false); }
  }

  async function cancel() {
    if (pending || !view || view.status !== "waiting_approval") return;
    setPending(true); setNotice("");
    try {
      const response = await fetch(`/api/agent/runs/${encodeURIComponent(view.id)}/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const body = await response.json();
      if (!response.ok) { setNotice(body.error ?? "取消失败。"); return; }
      setView(body as RunView); setNotice("Run 已取消，不会执行写入。");
    } catch { setNotice("取消请求失败。"); }
    finally { setPending(false); }
  }

  return <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6" aria-label="可恢复 Agent Run">
    <h2 className="text-lg font-semibold text-stone-900">4.6 · 可恢复研究 Run</h2>
    <p className="mt-1 text-sm text-stone-600">Run、时间线和待确认 Action 保存在 PostgreSQL。刷新页面后会按 Run ID 重新读取。</p>
    <label className="mt-4 block text-sm font-medium text-stone-700">研究目标
      <input value={goal} onChange={event => setGoal(event.target.value)} maxLength={2000}
        className="mt-2 w-full rounded-lg border border-sky-200 bg-white px-3 py-2" /></label>
    <label className="mt-4 block text-sm font-medium text-stone-700">演示路径
      <select value={demo} onChange={event => setDemo(event.target.value)}
        className="mt-2 w-full rounded-lg border border-sky-200 bg-white px-3 py-2 sm:max-w-xs">
        <option value="research_workflow">正常：搜索 → 提议 → 等待确认</option>
        <option value="persistent_provider_failure">故障：可恢复的模型失败</option>
        <option value="persistent_budget_final">故障：第二次模型前预算不足</option>
      </select></label>
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={pending || !goal.trim()} onClick={start}
        className="rounded-lg bg-sky-700 px-4 py-2 text-sm text-white disabled:opacity-50">开始 Run</button>
      <button type="button" disabled={pending} onClick={() => { const id = localStorage.getItem(storageKey); if (id) void load(id); else setNotice("当前浏览器没有最近 Run ID。"); }}
        className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm text-stone-700 disabled:opacity-50">恢复最近 Run</button>
      {view?.status === "paused" && <button type="button" disabled={pending} onClick={resume}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">Resume</button>}
    </div>
    {pending && <p className="mt-3 text-sm text-stone-600">正在读取数据库状态…</p>}
    {notice && <p className="mt-3 text-sm text-stone-700" role="status">{notice}</p>}
    {view && <div className="mt-5 rounded-xl border border-sky-100 bg-white p-4">
      <p className="break-all text-xs text-stone-500">Run ID：{view.id}</p>
      <p className="mt-1 text-sm font-semibold text-stone-900">数据库状态：{view.status} · 当前步骤 {view.currentStep}</p>
      <ol className="mt-4 space-y-2" aria-label="持久化 Workflow 时间线">
        {view.timeline.map(step => <li key={step.id} className="flex gap-2 text-sm text-stone-700">
          <span className="font-medium text-sky-700">{step.position}.</span>
          <span>{step.label} · {step.status}{step.errorCategory ? ` · ${step.errorCategory}` : ""}</span>
        </li>)}
      </ol>
      {view.proposal && <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="font-semibold text-stone-900">等待你的确认；当前没有写入 Resource</p>
        <p className="mt-2 text-xs text-stone-600">精确标题</p><p className="break-words text-sm">{view.proposal.title}</p>
        <p className="mt-2 text-xs text-stone-600">精确内容</p><p className="whitespace-pre-wrap break-words text-sm">{view.proposal.content}</p>
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={pending} onClick={() => void confirm(view.proposal!.approvalToken)}
            className="rounded-lg bg-amber-700 px-4 py-2 text-sm text-white disabled:opacity-50">确认保存</button>
          <button type="button" disabled={pending} onClick={cancel}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm disabled:opacity-50">取消提议</button>
        </div>
      </div>}
      {view.saved && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
        已保存：{view.saved.title}（Resource #{view.saved.id}）
      </div>}
      {view.status === "completed" && lastToken && <button type="button" disabled={pending}
        onClick={() => void confirm(lastToken, true)} className="mt-3 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs disabled:opacity-50">
        实验：重复发送同一确认</button>}
    </div>}
    <p className="mt-4 text-xs text-stone-500">Run ID 不是权限凭证；每次读取和操作都由服务端 Session 验证归属。重复请求可能发生，同一 Action 的业务写入保持一条。</p>
  </section>;
}

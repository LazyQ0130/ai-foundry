"use client";

import { useState } from "react";
import sample from "../eval/sample-report.json";

export default function AgentEvalPanel() {
  const [notice, setNotice] = useState("");
  const gates = [
    ["跨用户泄漏", sample.hardGates.cross_user_leaks],
    ["未经批准写入", sample.hardGates.unapproved_writes],
    ["重复确认写入", sample.hardGates.duplicate_confirmed_writes],
  ] as const;
  async function copyCommand() {
    try { await navigator.clipboard.writeText("npm run eval:agent"); setNotice("命令已复制；请在项目终端运行。网页不会执行测试脚本。"); }
    catch { setNotice("请在项目终端运行 npm run eval:agent。"); }
  }
  return <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6" aria-label="Agent Eval 面板">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-stone-900">4.7 · Agent Eval</h2>
        <p className="mt-1 text-sm text-stone-600">课程自带的一次 deterministic 示例报告。你的实际结果请以终端生成的报告为准。</p></div>
      <button type="button" onClick={() => void copyCommand()}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white">复制 Run Eval 命令</button>
    </div>
    {notice && <p className="mt-2 text-sm text-blue-800" role="status">{notice}</p>}
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-white p-4"><p className="text-xs text-stone-500">固定案例</p>
        <p className="mt-1 text-2xl font-semibold text-stone-900">{sample.summary.passedCases}/{sample.summary.totalCases}</p>
        <p className="text-xs text-stone-600">通过 / 总数 · {sample.summary.failedCases} 失败</p></div>
      <div className="rounded-xl bg-white p-4"><p className="text-xs text-stone-500">安全硬门槛</p>
        <p className="mt-1 text-2xl font-semibold text-emerald-700">{sample.overallSafetyGate}</p>
        <p className="text-xs text-stone-600">三个指标分别判定，不能靠平均分抵消</p></div>
      <div className="rounded-xl bg-white p-4"><p className="text-xs text-stone-500">真实 Provider 单位</p>
        <p className="mt-1 text-2xl font-semibold text-stone-900">{sample.summary.totalProviderUnits}</p>
        <p className="text-xs text-stone-600">此示例使用 Mock/Stub 与隔离数据库</p></div>
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-3">
      {gates.map(([label, gate]) => <div key={label} className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm">
        <span className="text-stone-700">{label}</span><strong className="ml-2 text-emerald-700">{gate.observed} · {gate.passed ? "PASS" : "FAIL"}</strong>
      </div>)}
    </div>
    <p className="mt-4 text-sm text-stone-700">Functional {sample.categories.functional.passed}/{sample.categories.functional.total} · Safety {sample.categories.safety.passed}/{sample.categories.safety.total} · Reliability {sample.categories.reliability.passed}/{sample.categories.reliability.total}</p>
    <p className="mt-2 text-xs text-stone-500">p50 {sample.summary.p50LatencyMs} ms，p95 {sample.summary.p95LatencyMs} ms 是这一次小样本教学统计，不是生产性能基准。报告只根据可观察行为和数据库事实判断安全。</p>
  </section>;
}

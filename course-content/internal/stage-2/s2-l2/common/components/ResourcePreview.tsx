"use client";

import { useState, type FormEvent } from "react";

type Draft = { title: string; desc: string; tag: string };
type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "received"; resource: Draft; message: string }
  | { kind: "error"; message: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export default function ResourcePreview({ tags }: { tags: string[] }) {
  const categories = tags.filter((tag) => tag !== "全部");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState(categories[0] ?? "");
  const [preview, setPreview] = useState<Draft | null>(null);
  const [sendState, setSendState] = useState<SendState>({ kind: "idle" });

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview({ title: title.trim(), desc: desc.trim(), tag });
  }

  async function sendToServer() {
    setSendState({ kind: "sending" });
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, desc, tag }),
      });
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        throw new Error("无法读取服务端的 JSON 回复，请检查接口响应。");
      }
      if (!isObject(data)) throw new Error("服务端回复格式不正确。");
      if (!response.ok || data.ok !== true) {
        setSendState({ kind: "error", message: typeof data.error === "string" ? data.error : `请求失败（HTTP ${response.status}）。` });
        return;
      }
      const resource = data.resource;
      if (data.status !== "received" || data.saved !== false || !isObject(resource) ||
        typeof resource.title !== "string" || typeof resource.desc !== "string" || typeof resource.tag !== "string" ||
        typeof data.message !== "string") {
        throw new Error("服务端回复格式不正确，不能确认资料已收到。");
      }
      setSendState({ kind: "received", resource: { title: resource.title, desc: resource.desc, tag: resource.tag }, message: data.message });
    } catch (error) {
      setSendState({ kind: "error", message: error instanceof Error && error.message !== "Failed to fetch" ? error.message : "无法连接服务端，请确认开发服务器仍在运行。" });
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-emerald-200 bg-white p-5" aria-labelledby="preview-heading">
      <h2 id="preview-heading" className="text-lg font-semibold text-stone-900">试填一条新资料</h2>
      <p className="mt-1 text-sm text-stone-600">预览只在本页显示；发送后服务端会检查并回复，但资料仍未保存。</p>
      <form onSubmit={showPreview} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-stone-700">
          资料标题
          <input required value={title} onChange={(event) => { setTitle(event.target.value); setSendState({ kind: "idle" }); }} className="rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          简介
          <textarea required value={desc} onChange={(event) => { setDesc(event.target.value); setSendState({ kind: "idle" }); }} className="min-h-20 rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          分类标签
          <select required value={tag} onChange={(event) => { setTag(event.target.value); setSendState({ kind: "idle" }); }} className="rounded-lg border border-stone-300 px-3 py-2">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">预览资料</button>
          <button type="button" onClick={sendToServer} disabled={sendState.kind === "sending"} className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50">发送给服务端</button>
        </div>
      </form>
      {preview && (
        <div className="mt-5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-4" role="status">
          <p className="text-xs font-medium text-emerald-800">尚未保存的本页预览</p>
          <h3 className="mt-2 font-semibold text-stone-900">{preview.title}</h3>
          <p className="mt-1 text-sm text-stone-700">{preview.desc}</p>
          <p className="mt-2 text-xs text-emerald-800">{preview.tag}</p>
        </div>
      )}
      <div className="mt-5 rounded-lg border border-stone-200 p-4 text-sm" role="status" aria-live="polite">
        {sendState.kind === "idle" && <p>当前还没有向服务端发送资料。</p>}
        {sendState.kind === "sending" && <p>正在等待服务端回复…</p>}
        {sendState.kind === "error" && <p className="text-red-700">发送失败：{sendState.message}</p>}
        {sendState.kind === "received" && (
          <div>
            <p className="font-medium text-emerald-800">{sendState.message}</p>
            <p className="mt-1 text-stone-600">saved: false · 服务端已收到，尚未保存。</p>
            <h3 className="mt-2 font-semibold text-stone-900">{sendState.resource.title}</h3>
            <p className="mt-1 text-stone-700">{sendState.resource.desc}</p>
            <p className="mt-2 text-xs text-emerald-800">{sendState.resource.tag}</p>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type Draft = { title: string; desc: string; tag: string };
type SavedResource = Draft & {
  id: number;
  important: boolean;
  createdAt: string;
  updatedAt: string;
};
type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; resource: SavedResource; message: string }
  | { kind: "error"; message: string };
type ListState =
  | { kind: "loading" }
  | { kind: "ready"; resources: SavedResource[] }
  | { kind: "error"; message: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSavedResource(value: unknown): value is SavedResource {
  return isObject(value) && Number.isInteger(value.id) &&
    typeof value.title === "string" && typeof value.desc === "string" &&
    typeof value.tag === "string" && typeof value.important === "boolean" &&
    typeof value.createdAt === "string" && typeof value.updatedAt === "string";
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("无法读取服务端的 JSON 回复，请检查接口响应。");
  }
  if (!isObject(body)) throw new Error("服务端回复格式不正确。");
  return body;
}

function responseError(response: Response, body: Record<string, unknown>) {
  return typeof body.error === "string" ? body.error : `请求失败（HTTP ${response.status}）。`;
}

function connectionError(error: unknown) {
  return error instanceof TypeError ? "无法连接服务端，请确认开发服务器仍在运行。" :
    error instanceof Error ? error.message : "请求失败，请稍后重试。";
}

export default function ResourcePreview({ tags }: { tags: string[] }) {
  const categories = tags.filter((tag) => tag !== "全部");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState(categories[0] ?? "");
  const [preview, setPreview] = useState<Draft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [listState, setListState] = useState<ListState>({ kind: "loading" });
  const saveBusy = useRef(false);

  const loadResources = useCallback(async () => {
    setListState({ kind: "loading" });
    try {
      const response = await fetch("/api/resources", { cache: "no-store" });
      const body = await readJson(response);
      if (!response.ok || body.ok !== true) throw new Error(responseError(response, body));
      if (!Array.isArray(body.resources) || !body.resources.every(isSavedResource)) {
        throw new Error("服务端资料列表格式不正确。");
      }
      setListState({ kind: "ready", resources: body.resources });
    } catch (error) {
      setListState({ kind: "error", message: connectionError(error) });
    }
  }, []);

  useEffect(() => { void loadResources(); }, [loadResources]);

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview({ title: title.trim(), desc: desc.trim(), tag });
  }

  async function saveToDatabase() {
    if (saveBusy.current) return;
    saveBusy.current = true;
    setSaveState({ kind: "saving" });
    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, desc, tag }),
      });
      const body = await readJson(response);
      if (!response.ok || body.ok !== true) {
        setSaveState({ kind: "error", message: responseError(response, body) });
        return;
      }
      if (response.status !== 201 || body.status !== "saved" || body.saved !== true ||
        !isSavedResource(body.resource) || typeof body.message !== "string") {
        throw new Error("服务端回复不能证明资料已保存。");
      }
      setSaveState({ kind: "saved", resource: body.resource, message: body.message });
      // POST 已成功便不再重发；若这次 GET 失败，学生可单独点击“重新读取”。
      await loadResources();
    } catch (error) {
      setSaveState({ kind: "error", message: connectionError(error) });
    } finally {
      saveBusy.current = false;
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-emerald-200 bg-white p-5" aria-labelledby="preview-heading">
      <h2 id="preview-heading" className="text-lg font-semibold text-stone-900">新增资料</h2>
      <p className="mt-1 text-sm text-stone-600">预览仍只在本页显示；保存成功后，资料会从数据库重新读取。</p>
      <form onSubmit={showPreview} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-stone-700">
          资料标题
          <input required value={title} onChange={(event) => { setTitle(event.target.value); setSaveState({ kind: "idle" }); }} className="rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          简介
          <textarea required value={desc} onChange={(event) => { setDesc(event.target.value); setSaveState({ kind: "idle" }); }} className="min-h-20 rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          分类标签
          <select required value={tag} onChange={(event) => { setTag(event.target.value); setSaveState({ kind: "idle" }); }} className="rounded-lg border border-stone-300 px-3 py-2">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">预览资料</button>
          <button type="button" onClick={saveToDatabase} disabled={saveState.kind === "saving"} className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50">保存到数据库</button>
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
        {saveState.kind === "idle" && <p>当前还没有保存新资料。</p>}
        {saveState.kind === "saving" && <p>正在等待数据库保存结果…</p>}
        {saveState.kind === "error" && <p className="text-red-700">保存失败：{saveState.message}</p>}
        {saveState.kind === "saved" && (
          <div>
            <p className="font-medium text-emerald-800">{saveState.message} saved: true</p>
            <p className="mt-1 text-stone-600">数据库记录 #{saveState.resource.id}：{saveState.resource.title}</p>
          </div>
        )}
      </div>
      <div className="mt-8 border-t border-stone-200 pt-5" aria-labelledby="database-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="database-heading" className="text-lg font-semibold text-stone-900">数据库中已保存的资料</h2>
            <p className="text-sm text-stone-600">这里来自 GET /api/resources，与原始示例资料分开。</p>
          </div>
          <button type="button" onClick={() => void loadResources()} className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800">重新读取</button>
        </div>
        {listState.kind === "loading" && <p className="mt-4 text-sm text-stone-600">正在从数据库读取…</p>}
        {listState.kind === "error" && <p className="mt-4 text-sm text-red-700">读取失败：{listState.message} 可点击“重新读取”。</p>}
        {listState.kind === "ready" && listState.resources.length === 0 && <p className="mt-4 text-sm text-stone-600">数据库里还没有资料。</p>}
        {listState.kind === "ready" && listState.resources.map((resource) => (
          <article key={resource.id} className="mt-4 rounded-lg border border-stone-200 p-4">
            <h3 className="font-semibold text-stone-900">{resource.title}</h3>
            <p className="mt-1 text-sm text-stone-700">{resource.desc}</p>
            <p className="mt-2 text-xs text-stone-600">{resource.tag} · 创建于 {new Date(resource.createdAt).toLocaleString("zh-CN")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

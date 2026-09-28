"use client";

import { useState, type FormEvent } from "react";

type Draft = { title: string; desc: string; tag: string };

export default function ResourcePreview({ tags }: { tags: string[] }) {
  const categories = tags.filter((tag) => tag !== "全部");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState(categories[0] ?? "");
  const [preview, setPreview] = useState<Draft | null>(null);

  function showPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreview({ title: title.trim(), desc: desc.trim(), tag });
  }

  return (
    <section className="mt-8 rounded-xl border border-emerald-200 bg-white p-5" aria-labelledby="preview-heading">
      <h2 id="preview-heading" className="text-lg font-semibold text-stone-900">试填一条新资料</h2>
      <p className="mt-1 text-sm text-stone-600">当前只是本页预览，资料尚未保存。下一节会把输入交给真正的 API。</p>
      <form onSubmit={showPreview} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-stone-700">
          资料标题
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          简介
          <textarea required value={desc} onChange={(event) => setDesc(event.target.value)} className="min-h-20 rounded-lg border border-stone-300 px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm text-stone-700">
          分类标签
          <select required value={tag} onChange={(event) => setTag(event.target.value)} className="rounded-lg border border-stone-300 px-3 py-2">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <button type="submit" className="w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">预览资料</button>
      </form>
      {preview && (
        <div className="mt-5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-4" role="status">
          <p className="text-xs font-medium text-emerald-800">尚未保存的本页预览</p>
          <h3 className="mt-2 font-semibold text-stone-900">{preview.title}</h3>
          <p className="mt-1 text-sm text-stone-700">{preview.desc}</p>
          <p className="mt-2 text-xs text-emerald-800">{preview.tag}</p>
        </div>
      )}
    </section>
  );
}

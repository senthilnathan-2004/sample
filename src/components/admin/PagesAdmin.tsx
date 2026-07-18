"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type PageRow = { slug: string; title: string };

export function PagesAdmin({ pages }: { pages: PageRow[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // Prefill the slug for a fresh edit (full body re-entry — a rich editor with
  // load-existing is a documented simplification).
  function loadForEdit(s: string) {
    setSlug(s);
    setStatus(`Editing "${s}" — enter title + content and save to overwrite.`);
  }

  async function save() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, bodyHtml }),
    });
    const data = await res.json();
    setBusy(false);
    setStatus(res.ok ? `Saved /policies/${data.slug} ✓` : data.error || "Could not save.");
    if (res.ok) router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
      <aside className="rounded-card border border-hairline bg-white p-4 shadow-card">
        <p className="mb-2 font-heading font-bold">Existing pages</p>
        <ul className="grid gap-1 text-sm">
          {pages.map((p) => (
            <li key={p.slug}>
              <button onClick={() => loadForEdit(p.slug)} className="text-brand hover:underline">
                {p.title} <span className="text-muted">/{p.slug}</span>
              </button>
            </li>
          ))}
          {pages.length === 0 && <li className="text-muted">None yet.</li>}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Common slugs: privacy, terms, refund, shipping, faq, about, contact
        </p>
      </aside>

      <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
        <div className="grid gap-3">
          <label className="text-sm">Slug<Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. privacy" /></label>
          <label className="text-sm">Title<Input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="text-sm">
            Body (HTML — sanitized on save)
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              className="mt-1 w-full rounded-control border border-hairline p-3 font-mono text-xs focus:border-brand"
              placeholder="<h2>Section</h2><p>…</p>"
            />
          </label>
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={save} disabled={busy || !slug || !title}>
              {busy ? "Saving…" : "Save page"}
            </Button>
            {status && <span className="text-sm text-success" aria-live="polite">{status}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Cat = {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

export function CategoriesManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add() {
    if (name.trim().length < 2) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, sortOrder: initial.length + 1 }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not add.");
    setName("");
    setIcon("");
    router.refresh();
  }

  async function toggle(c: Cat) {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: c.name, icon: c.icon ?? "", sortOrder: c.sortOrder, isActive: !c.isActive }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-card border border-hairline bg-white p-4 shadow-card">
        <p className="mb-2 font-heading font-bold">Add category</p>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-48" />
          </label>
          <label className="text-sm">
            Icon (emoji)
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-24" />
          </label>
          <Button variant="primary" onClick={add} disabled={busy}>
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-warning">{error}</p>}
      </div>

      <div className="mt-4 overflow-x-auto rounded-card border border-hairline bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-muted">
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="border-b border-hairline last:border-0">
                <td className="p-3 font-medium">
                  {c.icon} {c.name}
                </td>
                <td className="p-3 text-muted">{c.slug}</td>
                <td className="p-3">{c.sortOrder}</td>
                <td className="p-3">
                  <span className={c.isActive ? "text-success" : "text-muted"}>
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => toggle(c)} className="text-brand hover:underline">
                    {c.isActive ? "Hide" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "./ImageUploader";
import { VariantRowBuilder, type VariantRow, emptyVariant } from "./VariantRowBuilder";

type Cat = { id: string; name: string };

export type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  care: string;
  images: string[];
  basePrice: number;
  compareAtPrice: number | null;
  variants: VariantRow[];
  leadTimeDays: number;
  isCustomizable: boolean;
  isBestseller: boolean;
  isActive: boolean;
  tags: string[];
};

const blank: ProductFormValue = {
  name: "",
  slug: "",
  category: "",
  description: "",
  care: "",
  images: [],
  basePrice: 0,
  compareAtPrice: null,
  variants: [{ ...emptyVariant }],
  leadTimeDays: 4,
  isCustomizable: false,
  isBestseller: false,
  isActive: true,
  tags: [],
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Cat[];
  initial?: Partial<ProductFormValue>;
}) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValue>({ ...blank, ...initial, category: initial?.category || categories[0]?.id || "" });
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<ProductFormValue>) => setV((s) => ({ ...s, ...patch }));

  async function save() {
    setBusy(true);
    setError("");
    const payload = {
      ...v,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      compareAtPrice: v.compareAtPrice || null,
      variants: v.variants.filter((x) => x.color.trim()),
    };
    const url = v.id ? `/api/admin/products/${v.id}` : "/api/admin/products";
    const res = await fetch(url, {
      method: v.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save product.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      {error && <p className="rounded-control bg-[color:var(--warning)]/10 px-3 py-2 text-sm text-warning">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <Input value={v.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="text-sm">
          Slug (optional)
          <Input value={v.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="auto from name" />
        </label>
        <label className="text-sm">
          Category
          <Select value={v.category} onChange={(e) => set({ category: e.target.value })} className="w-full">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm">
          Lead time (days)
          <Input type="number" value={v.leadTimeDays} onChange={(e) => set({ leadTimeDays: Number(e.target.value) || 0 })} />
        </label>
        <label className="text-sm">
          Base price ₹
          <Input type="number" value={v.basePrice} onChange={(e) => set({ basePrice: Number(e.target.value) || 0 })} />
        </label>
        <label className="text-sm">
          Compare-at (MRP) ₹
          <Input
            type="number"
            value={v.compareAtPrice ?? ""}
            onChange={(e) => set({ compareAtPrice: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="text-sm">
        Description
        <textarea
          value={v.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-control border border-hairline p-2 text-sm focus:border-brand"
        />
      </label>
      <label className="text-sm">
        Care instructions
        <textarea
          value={v.care}
          onChange={(e) => set({ care: e.target.value })}
          rows={2}
          className="mt-1 w-full rounded-control border border-hairline p-2 text-sm focus:border-brand"
        />
      </label>
      <label className="text-sm">
        Tags (comma-separated)
        <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
      </label>

      <div>
        <p className="mb-1 text-sm font-medium">Images</p>
        <ImageUploader value={v.images} onChange={(images) => set({ images })} />
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Variants</p>
        <VariantRowBuilder value={v.variants} onChange={(variants) => set({ variants })} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.isCustomizable} onChange={(e) => set({ isCustomizable: e.target.checked })} className="accent-brand" />
          Customizable
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.isBestseller} onChange={(e) => set({ isBestseller: e.target.checked })} className="accent-brand" />
          Bestseller
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="accent-brand" />
          Active
        </label>
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save product"}
        </Button>
        <Button variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

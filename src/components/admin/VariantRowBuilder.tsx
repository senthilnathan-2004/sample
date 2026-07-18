"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export type VariantRow = {
  color: string;
  size?: string;
  customTextAllowed: boolean;
  priceDelta: number;
  stock: number | null;
  sku?: string;
};

export const emptyVariant: VariantRow = {
  color: "",
  size: "",
  customTextAllowed: false,
  priceDelta: 0,
  stock: null,
  sku: "",
};

// Repeatable variant editor. stock=null means made-to-order.
export function VariantRowBuilder({
  value,
  onChange,
}: {
  value: VariantRow[];
  onChange: (rows: VariantRow[]) => void;
}) {
  const update = (i: number, patch: Partial<VariantRow>) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => onChange([...value, { ...emptyVariant }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="grid gap-2">
      {value.map((row, i) => (
        <div key={i} className="grid grid-cols-2 items-end gap-2 rounded-control border border-hairline p-2 sm:grid-cols-6">
          <label className="text-xs">
            Colour
            <Input value={row.color} onChange={(e) => update(i, { color: e.target.value })} className="h-9" />
          </label>
          <label className="text-xs">
            Size
            <Input value={row.size ?? ""} onChange={(e) => update(i, { size: e.target.value })} className="h-9" />
          </label>
          <label className="text-xs">
            +₹ delta
            <Input
              type="number"
              value={row.priceDelta}
              onChange={(e) => update(i, { priceDelta: Number(e.target.value) || 0 })}
              className="h-9"
            />
          </label>
          <label className="text-xs">
            Stock (blank = MTO)
            <Input
              type="number"
              value={row.stock ?? ""}
              onChange={(e) => update(i, { stock: e.target.value === "" ? null : Number(e.target.value) })}
              className="h-9"
            />
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={row.customTextAllowed}
              onChange={(e) => update(i, { customTextAllowed: e.target.checked })}
              className="accent-brand"
            />
            Custom text
          </label>
          <button type="button" onClick={() => remove(i)} className="h-9 text-sm text-warning hover:underline">
            Remove
          </button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={add} className="w-fit">
        + Add variant
      </Button>
    </div>
  );
}

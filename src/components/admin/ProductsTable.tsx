"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/format";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Row = {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  variants: number;
};

export function ProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [del, setDel] = useState<Row | null>(null);

  async function doDelete(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDel(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-card border border-hairline bg-white shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-muted">
            <th className="p-3 font-medium">Product</th>
            <th className="p-3 font-medium">Category</th>
            <th className="p-3 font-medium">Price</th>
            <th className="p-3 font-medium">Variants</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-hairline last:border-0 hover:bg-brand-tint-strong">
              <td className="p-3 font-medium">{p.name}</td>
              <td className="p-3 text-muted">{p.category}</td>
              <td className="p-3">{formatINR(p.basePrice)}</td>
              <td className="p-3">{p.variants}</td>
              <td className="p-3">
                <span className={p.isActive ? "text-success" : "text-muted"}>
                  {p.isActive ? "Active" : "Hidden"}
                </span>
              </td>
              <td className="p-3">
                <Link href={`/admin/products/${p.id}/edit`} className="text-brand hover:underline">
                  Edit
                </Link>
                {p.isActive && (
                  <button onClick={() => setDel(p)} className="ml-3 text-warning hover:underline">
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted">
                No products yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmDialog
        open={!!del}
        title={`Hide "${del?.name}"?`}
        message="This soft-deletes the product (isActive:false). It stays in past orders."
        confirmLabel="Hide product"
        onConfirm={() => del && doDelete(del.id)}
        onCancel={() => setDel(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressForm, emptyAddress, type AddressValue } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Address = AddressValue & { _id: string; isDefault: boolean };

export function AddressManager({
  initial,
}: {
  initial: Address[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<AddressValue>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressValue, string>>>({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function validate(): boolean {
    const e: typeof errors = {};
    if (draft.fullName.trim().length < 2) e.fullName = "Enter name";
    if (!/^\d{10}$/.test(draft.phone)) e.phone = "10-digit phone";
    if (!/^\d{6}$/.test(draft.pincode)) e.pincode = "6-digit pincode";
    if (draft.line1.trim().length < 3) e.line1 = "Enter address";
    if (draft.city.trim().length < 2) e.city = "Enter city";
    if (draft.state.trim().length < 2) e.state = "Enter state";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setBusy(true);
    const isNew = editing === "new";
    const url = isNew ? "/api/account/addresses" : `/api/account/addresses/${editing}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
  }

  async function setDefault(id: string) {
    await fetch(`/api/account/addresses/${id}?action=default`, { method: "PATCH" });
    router.refresh();
  }

  async function doDelete(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    router.refresh();
  }

  const startEdit = (a: Address) => {
    setDraft({ ...a });
    setErrors({});
    setEditing(a._id);
  };
  const startNew = () => {
    setDraft(emptyAddress);
    setErrors({});
    setEditing("new");
  };

  return (
    <div>
      {editing ? (
        <div className="rounded-card border border-hairline p-5 shadow-card">
          <h2 className="mb-4 font-heading text-lg font-bold">
            {editing === "new" ? "Add a new address" : "Edit address"}
          </h2>
          <AddressForm value={draft} errors={errors} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
          <div className="mt-4 flex gap-2">
            <Button variant="primary" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save address"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {initial.map((a) => (
              <div key={a._id} className="rounded-card border border-hairline p-4 shadow-card">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{a.fullName}</p>
                  {a.isDefault && (
                    <span className="rounded bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  {a.landmark ? `, ${a.landmark}` : ""}, {a.city}, {a.state} {a.pincode}
                </p>
                <p className="mt-1 text-sm text-muted">Phone: {a.phone}</p>
                <span className="mt-1 inline-block rounded bg-cream px-2 py-0.5 text-xs capitalize text-muted">
                  {a.type}
                </span>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <button onClick={() => startEdit(a)} className="text-brand hover:underline">
                    Edit
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => setDefault(a._id)} className="text-brand hover:underline">
                      Set as default
                    </button>
                  )}
                  <button onClick={() => setConfirmDelete(a._id)} className="text-warning hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={startNew}
              className="grid min-h-[120px] place-items-center rounded-card border-2 border-dashed border-hairline text-sm font-medium text-brand hover:bg-brand-tint"
            >
              + Add a new address
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this address?"
        message="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Account = {
  name: string;
  email?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export function ProfileForm({ account }: { account: Account }) {
  const [name, setName] = useState(account.name);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    setStatus(res.ok ? "Saved ✓" : "Could not save.");
  }

  return (
    <div className="rounded-card border border-hairline p-5 shadow-card">
      <h2 className="font-heading text-lg font-bold">Personal information</h2>
      <div className="mt-4 grid max-w-md gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input value={account.email ?? "—"} disabled />
          <p className="mt-1 text-xs text-muted">
            {account.email
              ? account.emailVerified
                ? "Verified"
                : "Not verified"
              : "No email linked"}{" "}
            · changing email requires re-verification (coming soon)
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input value={account.phone ?? "—"} disabled />
          <p className="mt-1 text-xs text-muted">
            {account.phone ? (account.phoneVerified ? "Verified" : "Not verified") : "No phone linked"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
          {status && <span className="text-sm text-success" aria-live="polite">{status}</span>}
        </div>
      </div>
    </div>
  );
}

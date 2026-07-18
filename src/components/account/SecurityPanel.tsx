"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SecurityPanel({
  hasPassword,
  email,
  phone,
}: {
  hasPassword: boolean;
  email?: string;
  phone?: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function change() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current || undefined, newPassword: next }),
    });
    const data = await res.json();
    setBusy(false);
    setOk(res.ok);
    setMsg(res.ok ? "Password updated ✓" : data.error || "Could not update password.");
    if (res.ok) {
      setCurrent("");
      setNext("");
    }
  }

  return (
    <div className="mt-5 rounded-card border border-hairline p-5 shadow-card">
      <h2 className="font-heading text-lg font-bold">Login &amp; security</h2>

      <div className="mt-3 text-sm text-muted">
        <p>Linked sign-in methods:</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {email && <li className="rounded bg-cream px-2 py-1">Email &amp; password</li>}
          {phone && <li className="rounded bg-cream px-2 py-1">Phone OTP</li>}
        </ul>
      </div>

      <div className="mt-4 grid max-w-md gap-3">
        <p className="text-sm font-medium">{hasPassword ? "Change password" : "Set a password"}</p>
        {hasPassword && (
          <Input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        )}
        <Input
          type="password"
          placeholder="New password (min 8 chars)"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
        />
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={change} disabled={busy || next.length < 8}>
            {busy ? "Updating…" : "Update password"}
          </Button>
          {msg && (
            <span className={`text-sm ${ok ? "text-success" : "text-warning"}`} aria-live="polite">
              {msg}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-hairline pt-4">
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out everywhere
        </Button>
      </div>
    </div>
  );
}

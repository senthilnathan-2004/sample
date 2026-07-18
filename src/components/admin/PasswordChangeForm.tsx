"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PasswordChangeForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setBusy(false);
    setOk(res.ok);
    setMsg(res.ok ? "Password updated ✓" : data.error || "Could not update.");
    if (res.ok) {
      setCurrent("");
      setNext("");
    }
  }

  return (
    <div className="grid max-w-sm gap-3 rounded-card border border-hairline bg-white p-4 shadow-card">
      <Input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Input type="password" placeholder="New password (min 8)" value={next} onChange={(e) => setNext(e.target.value)} />
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={submit} disabled={busy || next.length < 8}>
          {busy ? "Updating…" : "Change password"}
        </Button>
        {msg && <span className={`text-sm ${ok ? "text-success" : "text-warning"}`}>{msg}</span>}
      </div>
    </div>
  );
}

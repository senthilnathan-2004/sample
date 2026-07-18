"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-card border border-hairline bg-white p-6 shadow-card">
        <h1 className="text-center font-heading text-2xl font-extrabold text-brand">Lara&apos;s Pinnal</h1>
        <p className="mt-1 text-center text-sm text-muted">Admin sign in</p>
        <div className="mt-6 grid gap-3">
          {error && (
            <p className="rounded-control bg-[color:var(--warning)]/10 px-3 py-2 text-sm text-warning" role="alert">
              {error}
            </p>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <Button variant="primary" onClick={login} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
}

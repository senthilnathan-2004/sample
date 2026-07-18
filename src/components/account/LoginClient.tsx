"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "./OtpInput";
import { cn } from "@/lib/cn";

type Mode = "signin" | "register" | "phone";

export function LoginClient({ next, initialMode }: { next: string; initialMode: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone flow
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devHint, setDevHint] = useState(false);

  const done = () => router.push(next || "/account");

  async function emailSignIn() {
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    setBusy(false);
    if (res?.error) setError("Incorrect email or password.");
    else done();
  }

  async function register() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create account.");
      setBusy(false);
      return;
    }
    const s = await signIn("credentials", { redirect: false, email, password });
    setBusy(false);
    if (s?.error) setError("Account created — please sign in.");
    else done();
  }

  async function sendCode() {
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a 10-digit phone number.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: phone, purpose: "login" }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send code.");
      return;
    }
    setOtpSent(true);
    setDevHint(!!data.devMode);
  }

  async function verifyCode() {
    if (code.length !== 6) return;
    setBusy(true);
    setError("");
    const res = await signIn("otp", { redirect: false, phone, code, name });
    setBusy(false);
    if (res?.error) setError("Incorrect or expired code.");
    else done();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-center font-heading text-2xl font-extrabold text-brand">Lara&apos;s Pinnal</h1>
      <p className="mt-1 text-center text-sm text-muted">Sign in to your account</p>

      {/* Mode tabs */}
      <div className="mt-6 flex flex-wrap rounded-control border border-hairline p-1 text-sm font-medium">
        {(
          [
            ["signin", "Email"],
            ["phone", "Mobile OTP"],
            ["register", "Register"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={cn(
              "flex-1 whitespace-nowrap rounded-[7px] px-2 py-2 sm:px-4",
              mode === m ? "bg-brand text-white" : "text-ink hover:bg-brand-tint",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-hairline p-4 sm:p-6 shadow-card">
        {error && (
          <p className="mb-3 rounded-control bg-[color:var(--warning)]/10 px-3 py-2 text-sm text-warning" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        {mode === "signin" && (
          <div className="grid gap-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <Button variant="primary" onClick={emailSignIn} disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        )}

        {mode === "register" && (
          <div className="grid gap-3">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <Button variant="primary" onClick={register} disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </Button>
          </div>
        )}

        {mode === "phone" && (
          <div className="grid gap-3">
            {!otpSent ? (
              <>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  autoComplete="tel"
                />
                <Button variant="primary" onClick={sendCode} disabled={busy}>
                  {busy ? "Sending…" : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted" aria-live="polite">
                  Enter the 6-digit code sent to {phone}.
                  {devHint && (
                    <span className="mt-1 block text-xs text-brand">
                      Dev mode: the code is printed in the server console.
                    </span>
                  )}
                </p>
                <OtpInput value={code} onChange={setCode} />
                <Input placeholder="Your name (new users)" value={name} onChange={(e) => setName(e.target.value)} />
                <Button variant="primary" onClick={verifyCode} disabled={busy || code.length !== 6}>
                  {busy ? "Verifying…" : "Verify & continue"}
                </Button>
                <button onClick={sendCode} className="text-xs text-brand hover:underline" disabled={busy}>
                  Resend code
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        You can also{" "}
        <button onClick={() => router.push("/checkout")} className="text-brand underline">
          check out as a guest
        </button>
        .
      </p>
    </div>
  );
}

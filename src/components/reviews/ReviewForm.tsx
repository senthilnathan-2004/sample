"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Write-a-review form. New reviews are held for admin approval (Phase 5).
export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (rating < 1) {
      setMsg("Please select a rating.");
      setOk(false);
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating,
        text,
        name: status === "authenticated" ? undefined : name,
      }),
    });
    const data = await res.json();
    setBusy(false);
    setOk(res.ok);
    setMsg(res.ok ? data.message : data.error || "Could not submit review.");
    if (res.ok) {
      setRating(0);
      setText("");
    }
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-hairline bg-white p-4 sm:p-6 shadow-card">
      <p className="font-heading text-lg font-bold text-ink">Write a review</p>
      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={rating === s}
            aria-label={`${s} stars`}
            onClick={() => setRating(s)}
            className={cn(
              "text-3xl transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              s <= rating ? "text-brand" : "text-hairline"
            )}
          >
            ★
          </button>
        ))}
      </div>
      {status !== "authenticated" && (
        <div className="mt-5">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={4}
        className="mt-4 w-full resize-none rounded-xl border border-hairline p-4 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
      />
      <div className="mt-5 flex items-center justify-between">
        <Button variant="primary" onClick={submit} disabled={busy} className="rounded-full px-6">
          {busy ? "Submitting…" : "Submit review"}
        </Button>
        {msg && (
          <span className={cn("text-sm font-medium", ok ? "text-success" : "text-warning")} aria-live="polite">
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

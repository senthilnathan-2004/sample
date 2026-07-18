"use client";

import { useRef } from "react";

// 6-box OTP entry. Auto-advances, supports paste, exposes the joined value.
export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const setDigit = (i: number, d: string) => {
    const clean = d.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(6, " ").split("");
    arr[i] = clean || " ";
    onChange(arr.join("").replace(/\s/g, ""));
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div className="flex gap-2" role="group" aria-label="One-time password">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d.trim() && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (pasted) onChange(pasted);
          }}
          className="h-12 w-11 rounded-control border border-hairline text-center text-lg font-semibold focus:border-brand"
        />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { IconPin, IconChevronDown } from "@/components/ui/icons";

/**
 * Zepto-style "Deliver to" selector. Shows a stored pincode (session state) or
 * "Select location". Full address-linked behavior arrives with accounts.
 */
export function DeliverToBadge() {
  const [pincode, setPincode] = useState<string>("");
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center gap-1 text-ink">
      <IconPin className="h-5 w-5 shrink-0 text-brand" />
      {editing ? (
        <input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          placeholder="Pincode"
          defaultValue={pincode}
          onBlur={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(v);
            setEditing(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="h-9 w-28 rounded-control border border-hairline px-2 text-sm text-ink focus:border-brand focus:outline-none"
        />
      ) : (
        <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-left leading-tight">
          <span>
            <span className="block text-[11px] text-muted">Deliver to</span>
            <span className="block text-sm font-semibold text-ink">
              {pincode ? `Chennai ${pincode}` : "Select location"}
            </span>
          </span>
          <IconChevronDown className="h-4 w-4 text-muted" />
        </button>
      )}
    </div>
  );
}

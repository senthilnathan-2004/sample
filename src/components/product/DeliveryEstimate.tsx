"use client";

import { useState } from "react";
import { IconPin } from "@/components/ui/icons";
import { deliveryDateLabel } from "@/lib/format";

/**
 * "Handmade — ships in X days; deliver to <pincode> by <date>".
 * Pincode → city/state lookup is deferred (owner to choose a source); for now we
 * echo the pincode and compute a delivery date from the product lead time.
 */
export function DeliveryEstimate({ leadTimeDays }: { leadTimeDays: number }) {
  const [pincode, setPincode] = useState("");
  const valid = /^\d{6}$/.test(pincode);

  return (
    <div className="rounded-control border border-hairline bg-cream p-3 text-sm">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        <IconPin className="h-4 w-4 text-brand" />
        Handmade — ships in {leadTimeDays} {leadTimeDays === 1 ? "day" : "days"}
      </p>
      <div className="mt-2 flex gap-2">
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter pincode"
          aria-label="Delivery pincode"
          className="h-9 w-32 rounded-control border border-hairline px-2 text-sm focus:border-brand"
        />
      </div>
      {valid && (
        <p className="mt-2 text-muted" aria-live="polite">
          Deliver to <span className="font-medium text-ink">{pincode}</span> by{" "}
          <span className="font-medium text-ink">{deliveryDateLabel(leadTimeDays + 2)}</span>
        </p>
      )}
    </div>
  );
}

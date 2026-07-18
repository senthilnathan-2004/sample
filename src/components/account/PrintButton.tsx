"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton({ label = "Print / save invoice" }: { label?: string }) {
  return (
    <Button variant="secondary" className="no-print" onClick={() => window.print()}>
      {label}
    </Button>
  );
}

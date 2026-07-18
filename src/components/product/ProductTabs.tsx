"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductTabs({ description, care }: { description: string; care?: string }) {
  const tabs = [
    { key: "desc", label: "Description", content: description },
    ...(care ? [{ key: "care", label: "Care", content: care }] : []),
  ];
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <section className="mt-10">
      <div className="flex gap-1 border-b border-hairline">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium",
              active === t.key ? "border-brand text-brand" : "border-transparent text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="prose max-w-none py-4 text-sm leading-relaxed text-ink">
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </section>
  );
}

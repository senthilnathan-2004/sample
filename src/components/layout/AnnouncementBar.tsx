import type { AnnouncementBar as Bar } from "@/types";

export function AnnouncementBar({ bar }: { bar: Bar }) {
  if (!bar.active || !bar.text) return null;
  return (
    <div className="bg-brand text-center text-xs font-medium text-white sm:text-sm">
      <p className="mx-auto max-w-page px-4 py-1.5">{bar.text}</p>
    </div>
  );
}

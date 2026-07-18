"use client";

import { useEffect, useState } from "react";

// True only after client hydration — used to defer localStorage-backed store
// values so SSR (which renders 0/empty) doesn't mismatch the hydrated DOM.
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

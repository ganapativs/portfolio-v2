"use client";
import { useEffect, useState } from "react";

/**
 * True only after hydration.
 *
 * The theme is decided before React exists — the no-flash script reads storage
 * and stamps `data-theme` on <html>, and ThemeProvider seeds its state from
 * that. The server had no way to know which one it would be, so anything whose
 * *markup* depends on the theme has to hold the server's shape for one render
 * and correct itself after. Colour is not one of those things: that belongs in
 * CSS, keyed on the same attribute.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

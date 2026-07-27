"use client";

import { useSyncExternalStore } from "react";

/**
 * Suit une media query (SSR-safe : false côté serveur, puis synchronisé au
 * montage via matchMedia).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

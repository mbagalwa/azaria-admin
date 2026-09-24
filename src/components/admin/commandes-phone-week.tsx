"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Largeur à partir de laquelle la vue Mois redevient disponible (tablette). */
const TABLET = "(min-width: 768px)";

/**
 * Sur téléphone, la vue Mois n'est pas utilisable : on bascule vers Semaine.
 * À partir de la tablette, on ne force plus rien — Mois redevient cliquable.
 */
export function CommandesPhoneWeek({
  active,
  href,
}: {
  /** Vrai tant que l'URL demande la vue Mois. */
  active: boolean;
  /** URL de la même page en vue Semaine. */
  href: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const mql = window.matchMedia(TABLET);
    const apply = () => {
      if (!mql.matches && active) router.replace(href);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [active, href, router]);

  return null;
}

/** Sous-navigation de la page Paramètres (left bar + routing). */

import type { LucideIcon } from "lucide-react";
import { Bell, Store, UtensilsCrossed, Users } from "lucide-react";

export type ParametresNavItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const PARAMETRES_NAV: ParametresNavItem[] = [
  {
    href: "/parametres/plats",
    label: "Plats",
    description: "Catalogue des plats vendables",
    icon: UtensilsCrossed,
  },
  {
    href: "/parametres/utilisateurs",
    label: "Utilisateurs & rôles",
    description: "Comptes et accès de l'équipe",
    icon: Users,
  },
  {
    href: "/parametres/restaurant",
    label: "Restaurant",
    description: "Horaires, cut-off, devise, contact",
    icon: Store,
  },
  {
    href: "/parametres/notifications",
    label: "Notifications",
    description: "Email et WhatsApp Business",
    icon: Bell,
  },
];

/** Un item est actif si la route correspond exactement ou en est un sous-chemin. */
export function isParametresActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sous-navigation de la page Paramètres (left bar + routing). */

import type { LucideIcon } from "lucide-react";
import { Bell, Salad, Store, UtensilsCrossed, Users } from "lucide-react";

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
    href: "/parametres/accompagnements",
    label: "Accompagnements",
    description: "Ce qui accompagne les plats du jour",
    icon: Salad,
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
    description: "WhatsApp client et alertes Telegram",
    icon: Bell,
  },
];

/** Un item est actif si la route correspond exactement ou en est un sous-chemin. */
export function isParametresActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

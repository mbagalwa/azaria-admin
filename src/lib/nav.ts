/** Navigation principale du back-office (rail d'icônes + titres topbar). */

export type NavIcon =
  | "dashboard"
  | "dishes"
  | "calendar"
  | "orders"
  | "special"
  | "LayoutDashboard"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Accueil", icon: "LayoutDashboard" },
  { href: "/programmation", label: "Programme", icon: "calendar" },
  { href: "/commandes", label: "Commandes", icon: "orders" },
  { href: "/parametres", label: "Paramètres", icon: "settings" },
];

/** Un item est actif si la route correspond exactement, ou en est un sous-chemin. */
export function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Libellé de la page courante, pour le titre de la topbar. */
export function currentLabel(pathname: string): string {
  const match = [...NAV]
    .reverse()
    .find((item) => isActive(pathname, item.href));
  return match?.label ?? "Azaria";
}

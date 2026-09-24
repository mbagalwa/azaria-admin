"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV, isActive, type NavIcon } from "@/lib/nav";
import { customerAvatar } from "@/lib/cover";
import { useToast } from "@/components/ui/toast";
import { logoutAction } from "@/app/actions";
import { useEffect, useState } from "react";

/** Icône lucide par clé de navigation. */
const navIcons: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  LayoutDashboard: LayoutDashboard,
  dishes: UtensilsCrossed,
  calendar: CalendarDays,
  orders: ClipboardList,
  special: Sparkles,
  settings: Settings,
};

export type NavUser = {
  fullName: string | null;
  email: string;
  initials: string;
  role: string;
};

/** Un client (commande en cours) affiché dans le cluster d'avatars. */
export type NavClient = { seed: string; initials: string; name: string };

export function Navbar({
  user,
  clients,
  ordersInProgress,
}: {
  user: NavUser;
  clients: NavClient[];
  ordersInProgress: number;
}) {
  const pathname = usePathname();
  const toast = useToast();
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("azaria-theme", next ? "dark" : "light");
    setDark(next);
  }

  // Barre collante : le fond couvre toute la largeur (px-5 et non mx-5) pour que
  // le contenu défile DERRIÈRE la barre, et non dans ses gouttières latérales.
  return (
    <header className="sticky top-0 z-40 bg-(--app-background)/85 px-5 pt-4 pb-2 backdrop-blur-sm">
      <div className="relative mx-auto max-w-7xl">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label={navOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          onClick={() => setNavOpen((open) => !open)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          {navOpen ? (
            <X className="size-4.5" aria-hidden="true" />
          ) : (
            <Menu className="size-4.5" aria-hidden="true" />
          )}
        </button>
        <Link
          href="/"
          aria-label="Azaria - accueil"
          className="inline-flex min-w-0 items-center py-1.5"
        >
          <Logo size={30} />
        </Link>
      </div>

      {/* Onglets au centre (navigation principale) */}
      <nav className="hidden rounded-full p-1 lg:block">
        <ul className="flex items-center">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = navIcons[item.icon];
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-all duration-150 ${
                    active
                      ? "text-primary font-bold"
                      : "font-medium text-muted-foreground hover:text-foreground hover:font-semibold"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Cluster de droite */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Clients ayant une commande en cours + total en cours */}
        {clients.length > 0 && (
          <div
            className="hidden items-center rounded-full border border-border bg-card py-1 pl-2 pr-3 md:flex"
            title={`${ordersInProgress} commande${ordersInProgress > 1 ? "s" : ""} en cours`}
          >
            <AvatarGroup>
              {clients.map((client) => (
                <Avatar key={client.seed} size="sm">
                  <AvatarImage src={customerAvatar(client.seed)} alt={client.name} />
                  <AvatarFallback>{client.initials}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount className="size-6 text-[0.65rem]">
                {ordersInProgress}
              </AvatarGroupCount>
            </AvatarGroup>
          </div>
        )}

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() =>
            toast({ title: "Notifications", message: "Bientôt disponible." })
          }
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4.5" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        </button>

        {/* Menu utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-border bg-card p-1 pr-2 transition-colors hover:bg-muted"
              >
                <Avatar>
                  <AvatarImage src={customerAvatar(user.email)} alt="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-medium text-foreground">
                  {user.fullName ?? "Administrateur"}
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserRound className="size-4" aria-hidden="true" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {dark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
              {dark ? "Mode clair" : "Mode sombre"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logoutAction()}>
              <LogOut className="size-4" aria-hidden="true" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>

      {navOpen && (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border bg-card p-2 shadow-lg lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = navIcons[item.icon];
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setNavOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-muted font-semibold text-primary"
                        : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      </div>
    </header>
  );
}

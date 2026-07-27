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
  Moon,
  Settings,
  Sparkles,
  Sun,
  UserRound,
  UtensilsCrossed,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV, isActive, type NavIcon } from "@/lib/nav";
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

/** Avatar illustré via DiceBear (style micah), sans dépendance. */
function dicebear(seed: string) {
  return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(seed)}`;
}

/** Faux membres d'équipe (placeholder) - juste pour le groupe d'avatars. */
const TEAM = ["Nadine", "Jean", "Aisha"];

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("azaria-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <header className="pt-4 pb-2 mx-5">
      <div  className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 bg-card rounded-xl">
              {/* Logo */}
      <Link
        href="/"
        aria-label="Azaria - accueil"
        className="inline-flex items-center py-1.5 pl-1.5 pr-4"
      >
        <Logo size={30} />
      </Link>

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
      <div className="flex items-center gap-2.5">
        {/* Groupe d'avatars (équipe) - placeholder DiceBear */}
        <div className="hidden items-center rounded-full border border-border bg-card py-1 pl-2 pr-3 md:flex">
          <AvatarGroup>
            {TEAM.map((seed) => (
              <Avatar key={seed} size="sm">
                <AvatarImage src={dicebear(seed)} alt="" />
                <AvatarFallback>{seed.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount className="size-6 text-[0.65rem]">
              +8
            </AvatarGroupCount>
          </AvatarGroup>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
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
                  <AvatarImage src={dicebear(user.email)} alt="" />
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
            <DropdownMenuLabel>
              <span className="block text-sm font-medium text-foreground">
                {user.fullName ?? "Administrateur"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
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
    </header>
  );
}

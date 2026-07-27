"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { PARAMETRES_NAV, isParametresActive } from "@/lib/parametres-nav";
import { cn } from "@/lib/utils";

/**
 * Menu des Paramètres en version mobile : un bouton « Menus » (icône hamburger)
 * qui affiche la section courante et déplie la liste des sous-sections. La
 * sélection navigue puis referme le panneau. Masqué sur desktop (sidebar).
 */
export function ParametresMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = PARAMETRES_NAV.find((item) =>
    isParametresActive(pathname, item.href),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="parametres-mobile-nav"
        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">Menus</span>
          <span className="block truncate text-sm font-semibold text-foreground">
            {current?.label ?? "Paramètres"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id="parametres-mobile-nav"
          className="border-t border-border p-2"
        >
          {PARAMETRES_NAV.map((item) => {
            const active = isParametresActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      active ? "font-semibold" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PARAMETRES_NAV, isParametresActive } from "@/lib/parametres-nav";
import { cn } from "@/lib/utils";

/**
 * Barre latérale des Paramètres : la liste des sous-sections, l'item
 * courant mis en avant. Une carte sur desktop, une liste empilée sur mobile.
 */
export function ParametresSidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections des paramètres"
      className="rounded-xl border border-border bg-card p-2"
    >
      <ul className="flex flex-col gap-1">
        {PARAMETRES_NAV.map((item) => {
          const active = isParametresActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4.5 shrink-0",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      active ? "font-semibold" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 hidden truncate text-xs text-muted-foreground lg:block">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

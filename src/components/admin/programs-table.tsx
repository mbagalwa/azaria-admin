"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Pencil, Search, Utensils } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeleteProgramButton } from "@/components/admin/delete-program-button";
import { programCover } from "@/lib/cover";
import {
  PROGRAM_STATUS_LABEL,
  formatFR,
  formatRangeFR,
  programStatus,
  type ProgramStatus,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { ProgramSummary } from "@/lib/programs";

type TabKey = "all" | ProgramStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "upcoming", label: "À venir" },
  { key: "active", label: "En cours" },
  { key: "past", label: "Terminés" },
];

const STATUS_CLASS: Record<ProgramStatus, string> = {
  upcoming:
    "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  active:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  past: "bg-muted text-muted-foreground",
};

function programTitle(p: ProgramSummary): string {
  return p.title?.trim() || `Programme du ${formatFR(p.startDate)}`;
}

export function ProgramsTable({
  programs,
  today,
}: {
  programs: ProgramSummary[];
  today: string;
}) {
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      const status = programStatus(p.startDate, p.endDate, today);
      if (tab !== "all" && status !== tab) return false;
      if (!q) return true;
      return (
        programTitle(p).toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    });
  }, [programs, tab, query, today]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Onglets de statut */}
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (titre, code)…"
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <CalendarDays className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Aucun programme{query || tab !== "all" ? " ne correspond" : " pour l'instant"}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((p) => {
            const status = programStatus(p.startDate, p.endDate, today);
            const title = programTitle(p);
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:p-4"
              >
                <Link
                  href={`/programmation/${p.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={programCover(p.code)}
                    alt=""
                    className="size-11 shrink-0 rounded-lg bg-muted ring-1 ring-foreground/10"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.code} · {formatRangeFR(p.startDate, p.endDate)}
                    </p>
                  </div>
                </Link>

                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_CLASS[status],
                  )}
                >
                  {PROGRAM_STATUS_LABEL[status]}
                </span>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1" title="Jours programmés">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {p.scheduledDaysCount}/{p.daysCount}
                  </span>
                  <span className="inline-flex items-center gap-1" title="Plats programmés">
                    <Utensils className="size-3.5" aria-hidden="true" />
                    {p.dishesCount}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/programmation/${p.id}/modifier`}
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                    aria-label={`Modifier ${title}`}
                    title="Modifier"
                  >
                    <Pencil aria-hidden="true" />
                  </Link>
                  <DeleteProgramButton id={p.id} label={title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderGroupDialog } from "@/components/admin/order-group-dialog";
import { getToken } from "@/lib/auth";
import { listOrders, type OrderSummary } from "@/lib/orders";
import type { OrderMode } from "@/lib/order-status";
import {
  addDays,
  addMonths,
  dayNumber,
  eachDay,
  endOfMonth,
  endOfWeek,
  formatFR,
  formatRangeFR,
  monthLabelFR,
  startOfMonth,
  startOfWeek,
  todayISO,
  weekdayMon,
  weekdayShortFR,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes" };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type View = "month" | "week";
type ModeFilter = "all" | OrderMode;

/** Construit l'URL de la page en ne gardant que les paramètres utiles. */
function href(p: { view?: View; d?: string; mode?: ModeFilter }) {
  const sp = new URLSearchParams();
  if (p.view === "week") sp.set("view", "week");
  if (p.d) sp.set("d", p.d);
  if (p.mode && p.mode !== "all") sp.set("mode", p.mode);
  const s = sp.toString();
  return `/commandes${s ? `?${s}` : ""}`;
}

export default async function CommandesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const view: View = one(sp.view) === "week" ? "week" : "month";
  const modeRaw = one(sp.mode);
  const mode: ModeFilter =
    modeRaw === "delivery" || modeRaw === "pickup" ? modeRaw : "all";
  const dRaw = one(sp.d);
  const today = todayISO();
  const anchor = dRaw && ISO.test(dRaw) ? dRaw : today;

  const isMonth = view === "month";
  const gridStart = isMonth
    ? startOfWeek(startOfMonth(anchor))
    : startOfWeek(anchor);
  const gridEnd = isMonth ? endOfWeek(endOfMonth(anchor)) : addDays(gridStart, 6);
  const title = isMonth
    ? monthLabelFR(anchor)
    : formatRangeFR(gridStart, gridEnd);
  const prevD = isMonth ? addMonths(anchor, -1) : addDays(gridStart, -7);
  const nextD = isMonth ? addMonths(anchor, 1) : addDays(gridStart, 7);

  const modeTabs: { key: ModeFilter; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "delivery", label: "Livraison" },
    { key: "pickup", label: "Retrait" },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        {/* Titre + navigation */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold capitalize tracking-tight text-foreground">
            {title}
          </h1>
          <Link
            href={href({ view, d: prevD, mode })}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label={isMonth ? "Mois précédent" : "Semaine précédente"}
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
          <Link
            href={href({ view, d: nextD, mode })}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label={isMonth ? "Mois suivant" : "Semaine suivante"}
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>

        {/* Filtres + vue + aujourd'hui */}
        <div className="flex flex-wrap items-center gap-2">
          <nav className="inline-flex rounded-lg border border-border bg-card p-0.5">
            {modeTabs.map((t) => (
              <Link
                key={t.key}
                href={href({ view, d: anchor, mode: t.key })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === t.key
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <nav className="inline-flex rounded-lg border border-border bg-card p-0.5">
            {(
              [
                { key: "month", label: "Mois" },
                { key: "week", label: "Semaine" },
              ] as { key: View; label: string }[]
            ).map((v) => (
              <Link
                key={v.key}
                href={href({ view: v.key, d: anchor, mode })}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  view === v.key
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v.label}
              </Link>
            ))}
          </nav>

          <Link
            href={href({ view, mode })}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Aujourd&apos;hui
          </Link>
        </div>
      </header>

      <Suspense
        key={`${view}-${gridStart}-${mode}`}
        fallback={isMonth ? <MonthSkeleton /> : <WeekSkeleton />}
      >
        <CalendarData
          view={view}
          gridStart={gridStart}
          gridEnd={gridEnd}
          anchorMonth={anchor.slice(0, 7)}
          today={today}
          mode={mode}
        />
      </Suspense>
    </div>
  );
}

async function CalendarData({
  view,
  gridStart,
  gridEnd,
  anchorMonth,
  today,
  mode,
}: {
  view: View;
  gridStart: string;
  gridEnd: string;
  anchorMonth: string;
  today: string;
  mode: ModeFilter;
}) {
  const token = await getToken();
  const res = token
    ? await listOrders(token, { from: gridStart, to: gridEnd, limit: 200 })
    : null;
  const all = res?.ok ? res.data : [];
  const error = res && !res.ok ? res.message : null;

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }

  const orders = mode === "all" ? all : all.filter((o) => o.mode === mode);

  /** Groupement : jour → heure de livraison identique → commandes. */
  const byDay = new Map<string, Map<string, OrderSummary[]>>();
  for (const o of orders) {
    if (!byDay.has(o.deliveryDate)) byDay.set(o.deliveryDate, new Map());
    const dayMap = byDay.get(o.deliveryDate)!;
    if (!dayMap.has(o.deliveryTime)) dayMap.set(o.deliveryTime, []);
    dayMap.get(o.deliveryTime)!.push(o);
  }

  const groupsOf = (day: string) =>
    [...(byDay.get(day) ?? new Map<string, OrderSummary[]>())].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

  if (view === "week") {
    return (
      <WeekGrid
        days={eachDay(gridStart, gridEnd)}
        groupsOf={groupsOf}
        today={today}
        empty={orders.length === 0}
      />
    );
  }

  /** Vue mois : semaines empilées, façon agenda. */
  const days = eachDay(gridStart, gridEnd);
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const todayInGrid = today >= gridStart && today <= gridEnd;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "py-2 text-center text-xs font-medium",
              todayInGrid && i === weekdayMon(today)
                ? "font-semibold text-primary"
                : "text-muted-foreground",
            )}
          >
            {w}
          </div>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 divide-x divide-border border-b border-border last:border-b-0"
        >
          {week.map((day) => {
            const inMonth = day.slice(0, 7) === anchorMonth;
            const isToday = day === today;
            const isPast = day < today;
            const groups = groupsOf(day);
            const count = groups.reduce((s, [, list]) => s + list.length, 0);
            return (
              <div
                key={day}
                className={cn(
                  "relative flex min-h-28 flex-col p-1 pb-6",
                  isToday && "bg-primary/5",
                )}
                style={
                  !inMonth
                    ? {
                        backgroundImage:
                          "repeating-linear-gradient(135deg, transparent 0 5px, var(--muted) 5px 6px)",
                      }
                    : undefined
                }
              >
                {/* Ouvre le planning du jour (les chips restent cliquables au-dessus). */}
                <Link
                  href={`/commandes/${day}`}
                  aria-label={`Ouvrir le planning du ${formatFR(day)}`}
                  className="absolute inset-0 transition-colors hover:bg-muted/40"
                />
                {/* Badge du nombre de commandes du jour (repérage rapide). */}
                {count > 0 && (
                  <span className="pointer-events-none absolute right-1.5 top-1.5 z-10 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-primary-foreground">
                    {count}
                  </span>
                )}
                <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-0.5">
                  {groups.slice(0, 4).map(([time, list]) => (
                    <div key={time} className="pointer-events-auto">
                      <OrderGroupDialog
                        variant="line"
                        dimmed={!inMonth || isPast}
                        dateLabel={formatFR(day)}
                        time={time}
                        orders={list}
                      />
                    </div>
                  ))}
                  {groups.length > 4 && (
                    <span className="px-1 text-[0.65rem] text-muted-foreground">
                      +{groups.length - 4} créneau{groups.length - 4 > 1 ? "x" : ""}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "pointer-events-none absolute bottom-1 right-1.5 z-10 text-xs",
                    isToday
                      ? "font-bold text-primary"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
                  )}
                >
                  {dayNumber(day)}
                </span>
                {isToday && (
                  <span
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 bg-primary"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Vue semaine (7 cartes) — conservée via le sélecteur de vue. */
function WeekGrid({
  days,
  groupsOf,
  today,
  empty,
}: {
  days: string[];
  groupsOf: (day: string) => [string, OrderSummary[]][];
  today: string;
  empty: boolean;
}) {
  return (
    <div className="space-y-4">
      {empty && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <Inbox className="size-4" aria-hidden="true" />
          Aucune commande sur cette semaine.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const groups = groupsOf(day);
          const count = groups.reduce((s, [, list]) => s + list.length, 0);
          const isToday = day === today;
          return (
            <section
              key={day}
              className={cn(
                "flex min-h-36 flex-col overflow-hidden rounded-xl border border-border bg-card",
                isToday && "border-primary/50 ring-1 ring-primary/25",
              )}
            >
              <Link
                href={`/commandes/${day}`}
                aria-label={`Ouvrir le planning du ${formatFR(day)}`}
                className={cn(
                  "flex items-baseline justify-between border-b border-border px-2.5 py-1.5 transition-colors hover:bg-muted/50",
                  isToday && "bg-primary/5",
                )}
              >
                <span className="text-xs font-medium capitalize text-muted-foreground">
                  {weekdayShortFR(day)}
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    isToday ? "text-primary" : "text-foreground",
                  )}
                >
                  {dayNumber(day)}
                </span>
              </Link>

              <div className="flex flex-1 flex-col gap-1.5 p-2">
                {groups.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground/50">
                    —
                  </p>
                ) : (
                  groups.map(([time, list]) => (
                    <OrderGroupDialog
                      key={time}
                      dateLabel={formatFR(day)}
                      time={time}
                      orders={list}
                    />
                  ))
                )}
                {count > 0 && (
                  <p className="mt-auto pt-1 text-right text-[0.65rem] text-muted-foreground">
                    {count} commande{count > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MonthSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="flex justify-center py-2">
            <Skeleton className="h-3.5 w-8" />
          </div>
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 divide-x divide-border border-b border-border last:border-b-0"
        >
          {Array.from({ length: 7 }).map((_, di) => (
            <div key={di} className="min-h-28 space-y-1 p-1 pb-6">
              {(wi + di) % 3 === 0 && <Skeleton className="h-4 w-full" />}
              {(wi + di) % 4 === 0 && <Skeleton className="h-4 w-3/4" />}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WeekSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="flex justify-between border-b border-border px-2.5 py-1.5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-6" />
          </div>
          <div className="space-y-1.5 p-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

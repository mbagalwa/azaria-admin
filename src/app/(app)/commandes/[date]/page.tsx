import { Fragment, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Utensils,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSheet } from "@/components/admin/order-sheet";
import { getToken } from "@/lib/auth";
import { listOrders, type OrderSummary } from "@/lib/orders";
import { listDishes } from "@/lib/dishes";
import { addDays, formatFR, todayISO, weekdayShortFR, nowMinutesBusiness } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes du jour" };

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function CommandesJourPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!ISO.test(date)) {
    notFound();
  }
  const today = todayISO();

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/commandes?d=${date}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Calendrier
          </Link>
          <h1 className="mt-1 text-2xl font-bold capitalize tracking-tight text-foreground">
            {weekdayShortFR(date)} {formatFR(date)}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/commandes/${addDays(date, -1)}`}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label="Jour précédent"
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
          <Link
            href={`/commandes/${today}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Aujourd&apos;hui
          </Link>
          <Link
            href={`/commandes/${addDays(date, 1)}`}
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
            aria-label="Jour suivant"
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <Suspense key={date} fallback={<DaySkeleton />}>
        <DayPlanning date={date} isToday={date === today} />
      </Suspense>
    </div>
  );
}

type CellEntry = { order: OrderSummary; quantity: number };

type DishColumn = {
  key: string;
  name: string;
  imageUrl: string | null;
  ordersCount: number;
  cells: Map<number, CellEntry[]>;
};

async function DayPlanning({ date, isToday }: { date: string; isToday: boolean }) {
  const token = await getToken();
  const [ordersRes, dishesRes] = await Promise.all([
    token
      ? listOrders(token, { from: date, to: date, limit: 200 })
      : Promise.resolve(null),
    token ? listDishes(token) : Promise.resolve(null),
  ]);

  if (ordersRes && !ordersRes.ok) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {ordersRes.message}
      </p>
    );
  }
  const orders = ordersRes?.ok ? ordersRes.data : [];
  const dishImages = new Map(
    (dishesRes?.ok ? dishesRes.data : []).map((d) => [d.id, d.imageUrl]),
  );

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Aucune commande pour cette journée.
        </p>
      </div>
    );
  }

  /** Colonnes = plats commandés ce jour ; cases = heure → clients. */
  const columns = new Map<string, DishColumn>();
  const hoursSeen = new Set<number>();

  for (const order of orders) {
    const hour = Number(order.deliveryTime.slice(0, 2));
    hoursSeen.add(hour);
    for (const item of order.items) {
      const key = item.dishId !== null ? `d${item.dishId}` : `n${item.name}`;
      if (!columns.has(key)) {
        columns.set(key, {
          key,
          name: item.name,
          imageUrl: item.dishId !== null ? (dishImages.get(item.dishId) ?? null) : null,
          ordersCount: 0,
          cells: new Map(),
        });
      }
      const col = columns.get(key)!;
      // Une commande annulée reste affichée (barrée), mais ne gonfle pas les compteurs.
      if (order.status !== "cancelled") col.ordersCount++;
      if (!col.cells.has(hour)) col.cells.set(hour, []);
      col.cells.get(hour)!.push({ order, quantity: item.quantity });
    }
  }
  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const cancelledCount = orders.length - activeOrders.length;

  const cols = [...columns.values()].sort((a, b) => b.ordersCount - a.ordersCount);
  const minHour = Math.min(...hoursSeen);
  const maxHour = Math.max(...hoursSeen);
  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i,
  );
  // Heure « maintenant » dans le fuseau métier (pas celui du serveur Next).
  const nowMin = nowMinutesBusiness();
  const nowHour = Math.floor(nowMin / 60);
  const nowLabel = `${String(nowHour).padStart(2, "0")}:${String(nowMin % 60).padStart(2, "0")}`;
  const gridCols = `4.5rem repeat(${cols.length}, minmax(190px, 1fr))`;

  return (
    <div className="space-y-3">
      <p className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
        <CalendarDays className="size-4 text-primary" aria-hidden="true" />
        <span className="font-bold text-foreground">{activeOrders.length}</span>
        <span className="text-muted-foreground">
          commande{activeOrders.length > 1 ? "s" : ""} · {cols.length} plat
          {cols.length > 1 ? "s" : ""}
          {cancelledCount > 0 && ` · ${cancelledCount} annulée${cancelledCount > 1 ? "s" : ""}`}
        </span>
      </p>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        {/*
         * Grille UNIQUE (en-têtes + rangées) : les bordures sont portées par
         * les cellules, elles suivent donc toute la largeur défilée. La
         * colonne « Heure » est sticky à gauche.
         */}
        <div className="grid" style={{ gridTemplateColumns: gridCols }}>
          <div className="sticky left-0 z-20 flex items-end justify-center border-b border-border bg-card pb-2 pt-3 text-[0.65rem] font-medium uppercase text-muted-foreground">
            Heure
          </div>
          {cols.map((col) => (
            <div
              key={col.key}
              className="flex items-center gap-2.5 border-b border-l border-border px-3 py-2.5"
            >
              {col.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={col.imageUrl}
                  alt=""
                  className="size-9 shrink-0 rounded-full object-cover ring-1 ring-foreground/10"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Utensils className="size-4" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {col.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {col.ordersCount} commande{col.ordersCount > 1 ? "s" : ""}
                </span>
              </span>
            </div>
          ))}
          {hours.map((hour, hi) => {
            const isNowRow = isToday && hour === nowHour;
            const rowBorder = cn(
              hi < hours.length - 1 && "border-b border-border",
              isNowRow && "border-t border-t-red-500",
            );
            return (
              <Fragment key={hour}>
                <div
                  className={cn(
                    "sticky left-0 z-20 bg-card py-2 text-center text-xs font-medium text-muted-foreground",
                    rowBorder,
                  )}
                >
                  {isNowRow && (
                    <span className="pointer-events-none absolute -top-2.5 left-1 z-30 rounded-full bg-red-500 px-1.5 text-[0.6rem] font-bold leading-4 text-white">
                      {nowLabel}
                    </span>
                  )}
                  {String(hour).padStart(2, "0")}h
                </div>
                {cols.map((col) => {
                  const entries = (col.cells.get(hour) ?? []).sort((a, b) =>
                    a.order.deliveryTime.localeCompare(b.order.deliveryTime),
                  );
                  return (
                    <div
                      key={col.key}
                      className={cn(
                        "min-h-16 space-y-1 border-l border-border p-1",
                        rowBorder,
                        isNowRow && "bg-red-500/3",
                      )}
                    >
                      {entries.map((entry) => (
                        <OrderSheet
                          key={entry.order.id}
                          order={entry.order}
                          quantity={entry.quantity}
                        />
                      ))}
                    </div>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DaySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-56 rounded-lg" />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex gap-4 border-b border-border p-3">
          <Skeleton className="h-4 w-12" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border p-3 last:border-b-0">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

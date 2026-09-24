import { Suspense } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { getOrderStats, listOrders, type OrderSummary } from "@/lib/orders";
import { listDishes } from "@/lib/dishes";
import { formatUsd } from "@/lib/format";
import { addDays, todayISO, eachDay, formatFR, nowMinutesBusiness } from "@/lib/dates";
import {
  ORDER_STATUS_HEX,
  ORDER_STATUS_LABEL,
  ORDER_MODE_LABEL,
  type OrderStatus,
} from "@/lib/order-status";
import { customerAvatar, customerSeed } from "@/lib/cover";
import {
  StatusDonut,
  CaTrend,
  TopDishesBars,
  type DonutSegment,
} from "@/components/admin/dashboard-charts";
import { OrdersRealtime } from "@/components/admin/orders-realtime";

export default function DashboardPage() {
  const heading = formatFR(todayISO());
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Bonjour 👋</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Tableau de bord
          </h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          En direct · {heading}
        </span>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardBoard />
      </Suspense>

      <OrdersRealtime />
    </div>
  );
}

/* ------------------------------------------------------------------ data --- */

const DONUT_GROUPS: { keys: OrderStatus[]; label: string; color: string }[] = [
  { keys: ["pending"], label: ORDER_STATUS_LABEL.pending, color: ORDER_STATUS_HEX.pending },
  { keys: ["confirmed"], label: ORDER_STATUS_LABEL.confirmed, color: ORDER_STATUS_HEX.confirmed },
  { keys: ["preparing"], label: ORDER_STATUS_LABEL.preparing, color: ORDER_STATUS_HEX.preparing },
  { keys: ["ready"], label: ORDER_STATUS_LABEL.ready, color: ORDER_STATUS_HEX.ready },
  { keys: ["delivering"], label: ORDER_STATUS_LABEL.delivering, color: ORDER_STATUS_HEX.delivering },
  { keys: ["delivered", "picked_up"], label: "Terminées", color: ORDER_STATUS_HEX.delivered },
  { keys: ["cancelled"], label: ORDER_STATUS_LABEL.cancelled, color: ORDER_STATUS_HEX.cancelled },
];

function isOrderLate(o: OrderSummary, todayIso: string, nowMin: number): boolean {
  if (o.status === "delivered" || o.status === "picked_up" || o.status === "cancelled") {
    return false;
  }
  if (o.deliveryDate < todayIso) return true;
  if (o.deliveryDate === todayIso) {
    const [h, m] = o.deliveryTime.split(":").map(Number);
    return h * 60 + m < nowMin;
  }
  return false;
}

async function DashboardBoard() {
  const token = await getToken();
  if (!token) return null;

  const today = todayISO();
  const weekStart = addDays(today, -6);

  const [todayRes, weekRes, ordersRes, dishesRes] = await Promise.all([
    getOrderStats(token, { from: today, to: today }),
    getOrderStats(token, { from: weekStart, to: today }),
    listOrders(token, { from: today, to: today, limit: 200 }),
    listDishes(token),
  ]);

  if (!todayRes.ok || !weekRes.ok) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center text-sm text-destructive">
        Impossible de charger les indicateurs pour l’instant. Réessayez dans un moment.
      </div>
    );
  }

  const st = todayRes.data;
  const wk = weekRes.data;
  const orders = ordersRes.ok ? ordersRes.data : [];
  const dishes = dishesRes.ok ? dishesRes.data : [];
  const nowMin = nowMinutesBusiness();

  // --- ① tuiles du jour ---
  const modeTotal = st.byMode.delivery + st.byMode.pickup;

  // --- ② file d'action (commandes du jour, hors terminées/annulées) ---
  const cols = [
    { title: "À confirmer", color: ORDER_STATUS_HEX.pending, items: orders.filter((o) => o.status === "pending") },
    {
      title: "En préparation",
      color: ORDER_STATUS_HEX.preparing,
      items: orders.filter((o) => o.status === "confirmed" || o.status === "preparing"),
    },
    {
      title: "Prêtes · en route",
      color: ORDER_STATUS_HEX.ready,
      items: orders.filter((o) => o.status === "ready" || o.status === "delivering"),
    },
  ];

  // --- ③ donut statuts (aujourd'hui) ---
  const segments: DonutSegment[] = DONUT_GROUPS.map((g) => ({
    label: g.label,
    color: g.color,
    value: g.keys.reduce((s, k) => s + (st.byStatus[k] ?? 0), 0),
  }));

  // --- ④ courbe CA (7 derniers jours, comblée) ---
  const dailyByDate = new Map(wk.daily.map((d) => [d.date, d.grossCents]));
  const trend = eachDay(weekStart, today).map((iso) => ({
    label: String(Number(iso.slice(8, 10))),
    valueCents: dailyByDate.get(iso) ?? 0,
  }));

  // --- ⑥ santé (semaine) ---
  const paymentPct = Math.round(wk.rates.paymentRate * 100);
  const cancelPct = Math.round(wk.rates.cancellationRate * 100);
  const wkModeTotal = wk.byMode.delivery + wk.byMode.pickup;
  const deliveryPct = wkModeTotal ? Math.round((wk.byMode.delivery / wkModeTotal) * 100) : 0;

  // --- ⑦ ruptures ---
  const ruptures = dishes.filter((d) => !d.isAvailable);

  return (
    <div className="space-y-6">
      {/* ① AUJOURD'HUI */}
      <SectionLabel>Aujourd&apos;hui</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Chiffre d'affaires du jour">
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatUsd(st.revenue.grossCents)}
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            <span className="flex flex-col">
              <b className="tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatUsd(st.revenue.paidCents)}
              </b>
              <span className="text-muted-foreground">encaissé</span>
            </span>
            <span className="flex flex-col">
              <b className="tabular-nums text-amber-600 dark:text-amber-400">
                {formatUsd(st.revenue.unpaidCents)}
              </b>
              <span className="text-muted-foreground">à encaisser</span>
            </span>
          </div>
        </Tile>

        <Tile label="Commandes du jour">
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {st.orders.active}
          </p>
          <div className="mt-2 flex gap-4 text-xs">
            <span className="flex flex-col">
              <b className="tabular-nums text-foreground">{st.byMode.delivery}</b>
              <span className="text-muted-foreground">livraison</span>
            </span>
            <span className="flex flex-col">
              <b className="tabular-nums text-foreground">{st.byMode.pickup}</b>
              <span className="text-muted-foreground">retrait</span>
            </span>
            {st.orders.cancelled > 0 && (
              <span className="flex flex-col">
                <b className="tabular-nums text-muted-foreground">{st.orders.cancelled}</b>
                <span className="text-muted-foreground">annulées</span>
              </span>
            )}
          </div>
        </Tile>

        <Tile
          label="Commandes en retard"
          className={st.lateCount > 0 ? "border-amber-500/40" : undefined}
        >
          <p
            className={`text-3xl font-bold tracking-tight tabular-nums ${
              st.lateCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
            }`}
          >
            {st.lateCount}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {st.lateCount > 0
              ? "Créneau dépassé, pas encore livrées"
              : "Aucun retard, tout est à l’heure"}
          </p>
        </Tile>

        <Tile label="Panier moyen">
          <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
            {formatUsd(st.avgBasketCents)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {modeTotal} commande{modeTotal > 1 ? "s" : ""} aujourd’hui
          </p>
        </Tile>
      </div>

      {/* ② FILE D'ACTION */}
      <SectionLabel hint="la file de la cuisine, du plus urgent au servi">
        À traiter maintenant
      </SectionLabel>
      <div className="grid gap-4 lg:grid-cols-3">
        {cols.map((col) => (
          <div key={col.title} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="size-2.5 rounded-full" style={{ background: col.color }} />
                {col.title}
              </span>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">
                {col.items.length}
              </span>
            </div>
            {col.items.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Rien pour l’instant</p>
            ) : (
              <ul className="space-y-2">
                {col.items.slice(0, 4).map((o) => (
                  <li key={o.id}>
                    <OrderCard order={o} late={isOrderLate(o, today, nowMin)} />
                  </li>
                ))}
                {col.items.length > 4 && (
                  <li>
                    <Link
                      href={`/commandes/${today}`}
                      className="block py-1.5 text-center text-xs font-medium text-muted-foreground hover:text-primary"
                    >
                      + {col.items.length - 4} autre{col.items.length - 4 > 1 ? "s" : ""} →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* ③ + ④ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Statuts des commandes" note={`${st.orders.total} aujourd’hui`}>
          <p className="mb-3 text-xs text-muted-foreground">
            Répartition du pipeline. Les annulées ne sont jamais comptées dans le CA.
          </p>
          <StatusDonut segments={segments} />
        </Panel>
        <Panel title="Chiffre d'affaires" note="7 derniers jours">
          <p className="mb-3 text-xs text-muted-foreground">
            Total encaissable par jour (commandes annulées exclues).
          </p>
          <CaTrend points={trend} />
        </Panel>
      </div>

      {/* ⑤ + ⑥ */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top plats" note="7 derniers jours">
          <p className="mb-3 text-xs text-muted-foreground">Quantités commandées.</p>
          {wk.topDishes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Pas encore de commande sur la période.
            </p>
          ) : (
            <TopDishesBars items={wk.topDishes.map((d) => ({ name: d.name, quantity: d.quantity }))} />
          )}
        </Panel>
        <Panel title="Santé du service" note="7 derniers jours">
          <div className="space-y-4 pt-1">
            <Meter label="Taux de paiement" value={`${paymentPct}%`} pct={paymentPct} tone="good" />
            <Meter label="Taux d'annulation" value={`${cancelPct}%`} pct={cancelPct} tone="warn" />
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">Livraison vs retrait</span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {deliveryPct}% / {100 - deliveryPct}%
                </span>
              </div>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
                <span className="bg-primary" style={{ flex: deliveryPct || 1 }} />
                <span className="bg-amber-400" style={{ flex: 100 - deliveryPct || 1 }} />
              </div>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-muted-foreground">Panier moyen (7 j)</span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {formatUsd(wk.avgBasketCents)}
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* ⑦ RUPTURES */}
      <SectionLabel hint="plats retirés du menu, à réapprovisionner">
        Disponibilité
      </SectionLabel>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Ruptures</span>
          <span className="text-xs text-muted-foreground">
            {ruptures.length} sur {dishes.length} plats
          </span>
        </div>
        {ruptures.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aucune rupture — tous les plats sont disponibles. ✅
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {ruptures.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="grid size-6 place-items-center rounded-md bg-destructive/10 text-xs font-bold text-destructive">
                  ✕
                </span>
                <span className="flex-1 font-semibold text-foreground">{d.name}</span>
                <Link
                  href="/parametres/plats"
                  className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive hover:bg-destructive/15"
                >
                  Épuisé
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ presentation - */

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <h2 className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
      {hint && <span className="text-xs font-normal normal-case tracking-normal">— {hint}</span>}
    </h2>
  );
}

function Tile({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className ?? ""}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      {children}
    </div>
  );
}

function Meter({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "good" | "warn";
}) {
  const fill = tone === "good" ? "bg-emerald-500" : "bg-amber-500";
  const text = tone === "good" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold tabular-nums ${text}`}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <span className={`block h-full ${fill}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}

function OrderCard({ order, late }: { order: OrderSummary; late: boolean }) {
  const qty = order.items.reduce((s, i) => s + i.quantity, 0);
  const name = order.customer.fullName;
  return (
    <Link
      href={`/commandes/${order.deliveryDate}`}
      className={`block rounded-lg border bg-muted/40 p-2.5 transition-colors hover:border-primary ${
        late ? "border-amber-500/50" : "border-border"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">{order.code}</span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          {formatUsd(order.totalCents)}
        </span>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customerAvatar(customerSeed(order.customer))}
          alt=""
          className="size-4 rounded-full bg-muted"
        />
        <span className="truncate">{name}</span>
        <span className="font-medium tabular-nums text-foreground">{order.deliveryTime}</span>
        <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
          {ORDER_MODE_LABEL[order.mode]}
        </span>
        <span>
          {qty} plat{qty > 1 ? "s" : ""}
        </span>
        {late && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
            En retard
          </span>
        )}
      </div>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil, Utensils } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BarChart, DonutChart } from "@/components/admin/program-charts";
import { DeleteProgramButton } from "@/components/admin/delete-program-button";
import { getToken } from "@/lib/auth";
import { getProgram } from "@/lib/programs";
import { programCover } from "@/lib/cover";
import { formatUsd } from "@/lib/format";
import {
  PROGRAM_STATUS_LABEL,
  dayNumber,
  eachDay,
  formatFR,
  formatRangeFR,
  programStatus,
  todayISO,
  weekdayShortFR,
  type ProgramStatus,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export const metadata = { title: "Programme" };

const STATUS_CLASS: Record<ProgramStatus, string> = {
  upcoming: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  past: "bg-muted text-muted-foreground",
};

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  const res = token ? await getProgram(id, token) : null;
  if (!res || !res.ok) {
    notFound();
  }
  const p = res.data;
  const today = todayISO();
  const status = programStatus(p.startDate, p.endDate, today);
  const title = p.title?.trim() || `Programme du ${formatFR(p.startDate)}`;

  const dishCountByDate = new Map(p.days.map((d) => [d.date, d.dishes.length]));
  const barData = eachDay(p.startDate, p.endDate).map((d) => ({
    label: String(dayNumber(d)),
    value: dishCountByDate.get(d) ?? 0,
  }));

  const catCount = new Map<string, number>();
  for (const day of p.days) {
    for (const dish of day.dishes) {
      const c = dish.category?.trim() || "Sans catégorie";
      catCount.set(c, (catCount.get(c) ?? 0) + 1);
    }
  }
  const donutData = [...catCount.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const coverage = p.daysCount
    ? Math.round((p.scheduledDaysCount / p.daysCount) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/programmation"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux programmes
      </Link>

      {/* En-tête */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={programCover(p.code)}
          alt=""
          className="size-16 shrink-0 rounded-xl bg-muted ring-1 ring-foreground/10"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                STATUS_CLASS[status],
              )}
            >
              {PROGRAM_STATUS_LABEL[status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {p.code} · {formatRangeFR(p.startDate, p.endDate)}
          </p>
          {p.description && (
            <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/programmation/${p.id}/modifier`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil aria-hidden="true" />
            Modifier
          </Link>
          <DeleteProgramButton id={p.id} label={title} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Jours" value={p.daysCount} />
        <StatCard label="Jours programmés" value={p.scheduledDaysCount} />
        <StatCard label="Plats programmés" value={p.dishesCount} />
        <StatCard label="Commandes" value={p.ordersCount} hint="à venir" />
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Plats par jour">
          <BarChart data={barData} />
        </ChartCard>
        <ChartCard title="Répartition par catégorie">
          {donutData.length > 0 ? (
            <DonutChart data={donutData} />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun plat programmé.
            </p>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Couverture de l'intervalle">
        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${coverage}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {coverage}% — {p.scheduledDaysCount} jour
            {p.scheduledDaysCount > 1 ? "s" : ""} programmé
            {p.scheduledDaysCount > 1 ? "s" : ""} sur {p.daysCount}.
          </p>
        </div>
      </ChartCard>

      {/* Détail par date */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Détail par date</h2>
        {p.days.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <CalendarDays className="size-7 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Aucun plat n&apos;est encore programmé sur cet intervalle.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {p.days.map((day) => (
              <li
                key={day.date}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    <span className="capitalize">{weekdayShortFR(day.date)}</span>{" "}
                    {formatFR(day.date)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Utensils className="size-3.5" aria-hidden="true" />
                    {day.dishes.length} plat{day.dishes.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.dishes.map((dish) => (
                    <span
                      key={dish.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-border py-1 pl-1.5 pr-2.5 text-sm",
                        !dish.isAvailable && "opacity-60",
                      )}
                    >
                      {dish.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={dish.imageUrl}
                          alt=""
                          className="size-5 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Utensils className="size-3" aria-hidden="true" />
                        </span>
                      )}
                      <span className="font-medium text-foreground">
                        {dish.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatUsd(dish.priceCents)}
                      </span>
                      {!dish.isAvailable && (
                        <span className="text-xs text-muted-foreground">
                          · épuisé
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

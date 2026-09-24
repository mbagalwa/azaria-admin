import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil, Utensils } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BarChart } from "@/components/admin/program-charts";
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

  /** Un plat par jour : la barre mesure le nombre d'accompagnements proposés. */
  const extrasByDate = new Map(
    p.days.map((d) => [d.date, d.dish.accompaniments.length]),
  );
  const barData = eachDay(p.startDate, p.endDate).map((d) => ({
    label: String(dayNumber(d)),
    /** Initiale du jour : sur plusieurs semaines, le numéro seul est ambigu. */
    sublabel: weekdayShortFR(d).charAt(0).toUpperCase(),
    title: formatFR(d),
    value: extrasByDate.get(d) ?? 0,
  }));

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
          className="size-10 shrink-0 rounded-lg bg-muted ring-1 ring-foreground/10"
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

      {/* Deux colonnes : la liste des plats est le contenu dense, elle prend
          le double de largeur ; les stats tiennent dans une colonne étroite. */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Colonne gauche — statistiques */}
        <div className="space-y-4 lg:col-span-1">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Jours" value={p.daysCount} />
            <StatCard label="Jours programmés" value={p.scheduledDaysCount} />
            <StatCard label="Plats programmés" value={p.dishesCount} />
            <StatCard label="Commandes" value={p.ordersCount} hint="à venir" />
          </div>

          <ChartCard title="Accompagnements par jour">
            <BarChart data={barData} />
          </ChartCard>
        </div>

        {/* Colonne droite — liste des plats */}
        <div className="space-y-3 lg:col-span-2">
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
                    {day.dish.accompaniments.length} accompagnement
                    {day.dish.accompaniments.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-3",
                    !day.dish.isAvailable && "opacity-60",
                  )}
                >
                  {day.dish.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={day.dish.imageUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Utensils className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {day.dish.name}
                      {!day.dish.isAvailable && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          · épuisé
                        </span>
                      )}
                    </p>
                    {day.dish.category && (
                      <p className="text-xs text-muted-foreground">
                        {day.dish.category}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold text-primary">
                    {formatUsd(day.dish.priceCents)}
                  </span>
                </div>

                {day.dish.accompaniments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    {day.dish.accompaniments.map((a) => (
                      <span
                        key={a.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs",
                          !a.isAvailable && "opacity-60",
                        )}
                      >
                        <span className="font-medium text-foreground">{a.name}</span>
                        <span className="text-muted-foreground">
                          {a.priceCents > 0 ? `+ ${formatUsd(a.priceCents)}` : "inclus"}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
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

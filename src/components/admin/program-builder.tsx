"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarPlus, Loader2, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import {
  DishDayDialog,
  type AccompanimentOption,
  type DayAssignment,
  type DishOption,
} from "@/components/admin/dish-day-dialog";
import {
  dayNumber,
  eachDay,
  endOfWeek,
  formatFR,
  startOfWeek,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  createProgramAction,
  updateProgramAction,
} from "@/app/(app)/programmation/actions";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type OverlapProgram = {
  id: number;
  code: string;
  title: string | null;
  startDate: string;
  endDate: string;
};

type EditProgram = {
  id: number;
  title: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  /** Une entrée par date : LE plat du jour et ses accompagnements. */
  days: {
    date: string;
    dishId: number;
    priceCents: number;
    accompaniments: { accompanimentId: number; priceCents: number }[];
  }[];
};

type Props = {
  mode: "create" | "edit";
  dishes: DishOption[];
  accompaniments: AccompanimentOption[];
  existingPrograms: OverlapProgram[];
  program?: EditProgram;
};

export function ProgramBuilder({
  mode,
  dishes,
  accompaniments,
  existingPrograms,
  program,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(program?.title ?? "");
  const [description, setDescription] = useState(program?.description ?? "");
  const [startDate, setStartDate] = useState(program?.startDate ?? "");
  const [endDate, setEndDate] = useState(program?.endDate ?? "");
  /** Une seule assignation par date : le plat du jour. */
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>(
    () =>
      Object.fromEntries(
        (program?.days ?? []).map((d) => [
          d.date,
          {
            dishId: d.dishId,
            priceCents: d.priceCents,
            accompaniments: d.accompaniments,
          },
        ]),
      ),
  );
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const dishById = useMemo(
    () => new Map(dishes.map((d) => [d.id, d])),
    [dishes],
  );

  const validInterval = Boolean(startDate && endDate && endDate >= startDate);

  const weeks = useMemo(() => {
    if (!validInterval) return [];
    const days = eachDay(startOfWeek(startDate), endOfWeek(endDate));
    const chunks: string[][] = [];
    for (let i = 0; i < days.length; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [validInterval, startDate, endDate]);

  const overlaps = useMemo(() => {
    if (!validInterval) return [];
    return eachDay(startDate, endDate)
      .map((day) => ({
        day,
        programs: existingPrograms
          .filter((p) => day >= p.startDate && day <= p.endDate)
          .map((p) => p.title?.trim() || p.code),
      }))
      .filter((x) => x.programs.length > 0);
  }, [validInterval, startDate, endDate, existingPrograms]);

  const scheduledDays = Object.keys(assignments).length;
  const totalAccompaniments = Object.values(assignments).reduce(
    (sum, a) => sum + a.accompaniments.length,
    0,
  );

  function save() {
    setError(null);
    if (!validInterval) {
      setError("Choisissez un intervalle de dates valide (fin ≥ début).");
      return;
    }
    /** Les dates hors intervalle (après resserrement des bornes) sont ignorées. */
    const entries = Object.entries(assignments)
      .filter(([date]) => date >= startDate && date <= endDate)
      .map(([date, a]) => ({ date, ...a }));

    const payload = {
      title: title.trim() || null,
      description: description.trim() || null,
      startDate,
      endDate,
      entries,
    };

    startTransition(async () => {
      const res =
        mode === "edit" && program
          ? await updateProgramAction(program.id, payload)
          : await createProgramAction(payload);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/programmation/${res.id}`);
    });
  }

  return (
    <div className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Infos + intervalle */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Semaine du 20 juillet"
            disabled={pending}
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optionnel…"
            disabled={pending}
            className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15 disabled:opacity-50"
          />
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <Label>Intervalle de dates *</Label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            1ᵉʳ clic = début, 2ᵉ clic = fin. Double-clic sur un même jour pour un
            programme d&apos;une seule journée.
          </p>
        </div>
      </div>

      {/* Avertissement chevauchement */}
      {overlaps.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4" aria-hidden="true" />
            {overlaps.length} jour{overlaps.length > 1 ? "s" : ""} déjà couvert
            {overlaps.length > 1 ? "s" : ""} par un autre programme
          </p>
          <ul className="mt-1.5 space-y-0.5 text-amber-700/90 dark:text-amber-400/90">
            {overlaps.slice(0, 6).map((o) => (
              <li key={o.day}>
                {formatFR(o.day)} — {o.programs.join(", ")}
              </li>
            ))}
            {overlaps.length > 6 && <li>… et {overlaps.length - 6} autre(s)</li>}
          </ul>
          <p className="mt-1.5 text-xs text-amber-700/80 dark:text-amber-400/80">
            Vous pouvez tout de même enregistrer (chevauchement autorisé).
          </p>
        </div>
      )}

      {/* Calendrier */}
      {validInterval ? (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Cliquez sur un jour pour choisir son plat
            </p>
            <p className="text-xs text-muted-foreground">
              {scheduledDays} jour{scheduledDays > 1 ? "s" : ""} programmé
              {scheduledDays > 1 ? "s" : ""} · {totalAccompaniments}{" "}
              accompagnement{totalAccompaniments > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="pb-1 text-center text-xs font-medium text-muted-foreground"
              >
                {w}
              </div>
            ))}
            {weeks.map((week) =>
              week.map((day) => {
                const inRange = day >= startDate && day <= endDate;
                /** `undefined` tant que le jour n'a pas reçu son plat. */
                const assigned: DayAssignment | undefined = assignments[day];
                if (!inRange) {
                  return (
                    <div
                      key={day}
                      className="min-h-20 rounded-lg p-1.5 text-right text-xs text-muted-foreground/30"
                      aria-hidden="true"
                    >
                      {dayNumber(day)}
                    </div>
                  );
                }
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setEditingDate(day)}
                    disabled={pending}
                    className={cn(
                      "flex min-h-20 cursor-pointer flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-ring/40 hover:bg-muted/50",
                      assigned ? "border-primary/40 bg-primary/5" : "border-border",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {dayNumber(day)}
                      </span>
                      {assigned && assigned.accompaniments.length > 0 && (
                        <span
                          className="rounded-full bg-primary px-1.5 text-[0.6rem] font-bold leading-4 text-primary-foreground"
                          title={`${assigned.accompaniments.length} accompagnement(s)`}
                        >
                          +{assigned.accompaniments.length}
                        </span>
                      )}
                    </span>
                    {assigned && (
                      <span className="mt-1 block truncate rounded bg-background px-1 text-[0.65rem] font-semibold text-foreground ring-1 ring-border">
                        {dishById.get(assigned.dishId)?.name ?? "—"}
                      </span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <CalendarPlus className="size-7 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Choisissez les dates de début et de fin pour afficher le calendrier.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link
          href="/programmation"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <X aria-hidden="true" />
          Annuler
        </Link>
        <Button type="button" size="lg" onClick={save} disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              {mode === "edit" ? "Enregistrer" : "Créer le programme"}
            </>
          )}
        </Button>
      </div>

      <DishDayDialog
        open={editingDate !== null}
        onOpenChange={(o) => {
          if (!o) setEditingDate(null);
        }}
        dateLabel={editingDate ? formatFR(editingDate) : ""}
        dishes={dishes}
        accompaniments={accompaniments}
        selected={editingDate ? (assignments[editingDate] ?? null) : null}
        onConfirm={(assignment) => {
          if (!editingDate) return;
          const date = editingDate;
          setAssignments((a) => {
            const next = { ...a };
            if (assignment) next[date] = assignment;
            else delete next[date];
            return next;
          });
        }}
      />
    </div>
  );
}

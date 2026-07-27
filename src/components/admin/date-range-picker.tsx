"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { fr } from "react-day-picker/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatFR, formatRangeFR, fromISOLocal, toISOLocal } from "@/lib/dates";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Props = {
  /** Bornes en ISO "YYYY-MM-DD" (chaîne vide si non choisie). */
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
};

/**
 * Sélecteur d'intervalle de dates : un bouton qui ouvre un calendrier en mode
 * plage. 1er clic = début, 2e clic = fin (fermeture auto) ; un clic suivant
 * redémarre une nouvelle plage. Double-clic sur un même jour = plage d'un jour.
 */
export function DateRangePicker({ startDate, endDate, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  /** 2 mois côte à côte sur desktop, 1 seul sur mobile. */
  const twoMonths = useMediaQuery("(min-width: 640px)");

  const selected: DateRange | undefined = startDate
    ? {
        from: fromISOLocal(startDate),
        to: endDate ? fromISOLocal(endDate) : undefined,
      }
    : undefined;

  const label =
    startDate && endDate
      ? formatRangeFR(startDate, endDate)
      : startDate
        ? `${formatFR(startDate)} → …`
        : "Choisir l'intervalle de dates";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:opacity-50",
              startDate ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <CalendarIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="truncate">{label}</span>
          </button>
        }
      />
      <PopoverContent className="max-h-[80dvh] max-w-[calc(100vw-1rem)] overflow-auto">
        <Calendar
          mode="range"
          resetOnSelect
          locale={fr}
          numberOfMonths={twoMonths ? 2 : 1}
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={(range) => {
            const from = range?.from ? toISOLocal(range.from) : "";
            const to = range?.to ? toISOLocal(range.to) : "";
            onChange(from, to);
            if (from && to) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

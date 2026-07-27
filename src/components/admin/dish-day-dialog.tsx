"use client";

import { useState } from "react";
import { Check, Search, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export type DishOption = {
  id: number;
  name: string;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  priceCents: number;
};

/** Un plat sélectionné pour la date, avec son prix figé (payé par le client). */
export type DaySelection = { dishId: number; priceCents: number };

/**
 * Sélection des plats d'une date donnée (multi-choix, sans doublon), chacun
 * avec son PRIX FIGÉ : prérempli au prix catalogue (ou au prix déjà programmé
 * en édition), ajustable par l'admin. Contrôlé par le builder.
 */
export function DishDayDialog({
  open,
  onOpenChange,
  dateLabel,
  dishes,
  selected,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  dishes: DishOption[];
  selected: DaySelection[];
  onConfirm: (selection: DaySelection[]) => void;
}) {
  const [checked, setChecked] = useState<number[]>([]);
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");

  // Réinitialise à chaque ouverture (ajustement d'état pendant le rendu).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setChecked(selected.map((s) => s.dishId));
      setPrices(
        Object.fromEntries(
          selected.map((s) => [s.dishId, (s.priceCents / 100).toFixed(2)]),
        ),
      );
      setQuery("");
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (d.category ?? "").toLowerCase().includes(q),
      )
    : dishes;

  function toggle(dish: DishOption) {
    setChecked((c) =>
      c.includes(dish.id) ? c.filter((x) => x !== dish.id) : [...c, dish.id],
    );
    // Premier cochage : préremplit avec le prix catalogue.
    setPrices((p) =>
      p[dish.id] !== undefined
        ? p
        : { ...p, [dish.id]: (dish.priceCents / 100).toFixed(2) },
    );
  }

  function confirm() {
    const selection = checked.map((id) => {
      const catalog = dishes.find((d) => d.id === id);
      const parsed = Number.parseFloat((prices[id] ?? "").replace(",", "."));
      const priceCents =
        Number.isFinite(parsed) && parsed >= 0
          ? Math.round(parsed * 100)
          : (catalog?.priceCents ?? 0);
      return { dishId: id, priceCents };
    });
    onConfirm(selection);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plats du {dateLabel}</DialogTitle>
          <DialogDescription>
            Le prix indiqué est celui que le client paiera — ajustez-le si
            besoin.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un plat…"
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15"
          />
        </div>

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {dishes.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Aucun plat au catalogue. Ajoutez-en dans Paramètres → Plats.
            </li>
          )}
          {filtered.map((d) => {
            const on = checked.includes(d.id);
            return (
              <li
                key={d.id}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
                  on
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent hover:bg-muted",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(d)}
                  aria-pressed={on}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded border",
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {on && <Check className="size-3.5" aria-hidden="true" />}
                  </span>
                  {d.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={d.imageUrl}
                      alt=""
                      className="size-9 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Utensils className="size-4" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {d.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {d.category ?? "—"}
                      {!d.isAvailable && " · épuisé"}
                    </span>
                  </span>
                </button>

                {on ? (
                  <div className="relative shrink-0">
                    <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={prices[d.id] ?? ""}
                      onChange={(e) =>
                        setPrices((p) => ({ ...p, [d.id]: e.target.value }))
                      }
                      aria-label={`Prix de ${d.name}`}
                      title={`Prix catalogue : ${formatUsd(d.priceCents)}`}
                      className="h-8 w-24 rounded-md border border-input bg-background pl-5 pr-1.5 text-right text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15"
                    />
                  </div>
                ) : (
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {formatUsd(d.priceCents)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button type="button" size="lg" onClick={confirm}>
            Valider ({checked.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Check, Salad, Search, Utensils } from "lucide-react";
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

export type AccompanimentOption = {
  id: number;
  name: string;
  imageUrl: string | null;
  isAvailable: boolean;
  priceCents: number;
};

/** Un accompagnement retenu pour la date, avec son supplément figé. */
export type DayAccompaniment = { accompanimentId: number; priceCents: number };

/**
 * LE plat du jour, avec son PRIX FIGÉ (celui que le client paiera) et les
 * accompagnements proposés avec lui, eux aussi à prix figé.
 */
export type DayAssignment = {
  dishId: number;
  priceCents: number;
  accompaniments: DayAccompaniment[];
};

/**
 * Choix du plat d'une date : un SEUL plat (règle métier), plus autant
 * d'accompagnements que voulu. Les prix sont préremplis au catalogue (ou au
 * prix déjà programmé en édition) et restent ajustables. Contrôlé par le builder.
 */
export function DishDayDialog({
  open,
  onOpenChange,
  dateLabel,
  dishes,
  accompaniments,
  selected,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  dishes: DishOption[];
  accompaniments: AccompanimentOption[];
  selected: DayAssignment | null;
  onConfirm: (assignment: DayAssignment | null) => void;
}) {
  const [dishId, setDishId] = useState<number | null>(null);
  const [dishPrice, setDishPrice] = useState("");
  const [extras, setExtras] = useState<number[]>([]);
  const [extraPrices, setExtraPrices] = useState<Record<number, string>>({});
  const [query, setQuery] = useState("");

  // Réinitialise à chaque ouverture (ajustement d'état pendant le rendu).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDishId(selected?.dishId ?? null);
      setDishPrice(selected ? (selected.priceCents / 100).toFixed(2) : "");
      setExtras((selected?.accompaniments ?? []).map((a) => a.accompanimentId));
      setExtraPrices(
        Object.fromEntries(
          (selected?.accompaniments ?? []).map((a) => [
            a.accompanimentId,
            (a.priceCents / 100).toFixed(2),
          ]),
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

  /** Un clic sur le plat déjà choisi le retire (jour sans plat). */
  function pickDish(dish: DishOption) {
    if (dishId === dish.id) {
      setDishId(null);
      return;
    }
    setDishId(dish.id);
    setDishPrice((dish.priceCents / 100).toFixed(2));
  }

  function toggleExtra(a: AccompanimentOption) {
    setExtras((c) =>
      c.includes(a.id) ? c.filter((x) => x !== a.id) : [...c, a.id],
    );
    setExtraPrices((p) =>
      p[a.id] !== undefined ? p : { ...p, [a.id]: (a.priceCents / 100).toFixed(2) },
    );
  }

  /** Convertit une saisie en centimes, avec repli sur le prix catalogue. */
  function toCents(raw: string | undefined, fallback: number): number {
    const parsed = Number.parseFloat((raw ?? "").replace(",", "."));
    return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : fallback;
  }

  function confirm() {
    if (dishId === null) {
      onConfirm(null);
      onOpenChange(false);
      return;
    }
    const dish = dishes.find((d) => d.id === dishId);
    onConfirm({
      dishId,
      priceCents: toCents(dishPrice, dish?.priceCents ?? 0),
      accompaniments: extras.map((id) => {
        const catalog = accompaniments.find((a) => a.id === id);
        return {
          accompanimentId: id,
          priceCents: toCents(extraPrices[id], catalog?.priceCents ?? 0),
        };
      }),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plat du {dateLabel}</DialogTitle>
          <DialogDescription>
            Un seul plat par jour. Le prix indiqué est celui que le client
            paiera.
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

        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {dishes.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Aucun plat au catalogue. Ajoutez-en dans Paramètres → Plats.
            </li>
          )}
          {filtered.map((d) => {
            const on = dishId === d.id;
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
                  onClick={() => pickDish(d)}
                  aria-pressed={on}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
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
                      value={dishPrice}
                      onChange={(e) => setDishPrice(e.target.value)}
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

        {/* Accompagnements : visibles seulement une fois le plat choisi. */}
        {dishId !== null && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-sm font-medium text-foreground">
              Accompagnements proposés
              <span className="ml-1.5 font-normal text-muted-foreground">
                ({extras.length} sélectionné{extras.length > 1 ? "s" : ""})
              </span>
            </p>
            {accompaniments.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                Aucun accompagnement. Créez-en dans Paramètres →
                Accompagnements.
              </p>
            ) : (
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {accompaniments.map((a) => {
                  const on = extras.includes(a.id);
                  return (
                    <li
                      key={a.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2 py-1 transition-colors",
                        on
                          ? "border-primary/40 bg-primary/5"
                          : "border-transparent hover:bg-muted",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExtra(a)}
                        aria-pressed={on}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                      >
                        <span
                          className={cn(
                            "flex size-4.5 shrink-0 items-center justify-center rounded border",
                            on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input",
                          )}
                        >
                          {on && <Check className="size-3" aria-hidden="true" />}
                        </span>
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.imageUrl}
                            alt=""
                            className="size-7 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                            <Salad className="size-3.5" aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0 truncate text-sm text-foreground">
                          {a.name}
                          {!a.isAvailable && (
                            <span className="text-muted-foreground"> · indisponible</span>
                          )}
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
                            value={extraPrices[a.id] ?? ""}
                            onChange={(e) =>
                              setExtraPrices((p) => ({ ...p, [a.id]: e.target.value }))
                            }
                            aria-label={`Supplément de ${a.name}`}
                            className="h-7 w-20 rounded-md border border-input bg-background pl-5 pr-1.5 text-right text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15"
                          />
                        </div>
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {a.priceCents > 0 ? `+ ${formatUsd(a.priceCents)}` : "Inclus"}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

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
            {dishId === null ? "Laisser vide" : "Valider"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

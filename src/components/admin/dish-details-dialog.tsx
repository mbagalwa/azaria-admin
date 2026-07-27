"use client";

import { Eye, UtensilsCrossed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatUsd } from "@/lib/format";
import type { ApiDish } from "@/lib/dishes";

type Props = {
  /** Le plat à détailler (interface JSON réutilisable ailleurs). */
  dish: ApiDish;
  /** Déclencheur personnalisé ; par défaut, l'icône œil de survol. */
  trigger?: React.ReactElement;
};

/**
 * Modal d'aperçu complet d'un plat. Réutilisable : il suffit de lui passer un
 * `dish`. Par défaut, il s'ouvre via une icône œil (visible au survol de la carte).
 */
export function DishDetailsDialog({ dish, trigger }: Props) {
  const defaultTrigger = (
    <button
      type="button"
      aria-label={`Voir les détails de ${dish.name}`}
      className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm ring-1 ring-foreground/10 backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100 cursor-pointer"
    >
      <Eye className="size-4" aria-hidden="true" />
    </button>
  );

  return (
    <Dialog>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="max-w-lg">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="max-h-64 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <UtensilsCrossed className="size-10" aria-hidden="true" />
          </div>
        )}

        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle>{dish.name}</DialogTitle>
            <span className="shrink-0 text-lg font-bold text-primary">
              {formatUsd(dish.priceCents)}
            </span>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          {dish.category && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {dish.category}
            </span>
          )}
          <span
            className={
              dish.isAvailable
                ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {dish.isAvailable ? "Disponible" : "Épuisé"}
          </span>
        </div>

        {dish.description ? (
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {dish.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Aucune description.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

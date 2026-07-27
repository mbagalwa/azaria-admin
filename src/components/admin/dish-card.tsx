import Link from "next/link";
import { Pencil, UtensilsCrossed } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeleteDishButton } from "@/components/admin/delete-dish-button";
import { DishDetailsDialog } from "@/components/admin/dish-details-dialog";
import { formatUsd, type ApiDish } from "@/lib/dishes";
import { cn } from "@/lib/utils";

/** Carte d'un plat dans la grille du catalogue. */
export function DishCard({ dish }: { dish: ApiDish }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative h-44 shrink-0 bg-muted">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dish.imageUrl}
            alt={dish.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <UtensilsCrossed className="size-8" aria-hidden="true" />
          </div>
        )}
        {!dish.isAvailable && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-xs font-medium text-background">
            Épuisé
          </span>
        )}
        <DishDetailsDialog dish={dish} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground">
            {dish.name}
          </h3>
          <span className="shrink-0 font-semibold text-primary">
            {formatUsd(dish.priceCents)}
          </span>
        </div>

        {dish.category && (
          <span className="w-fit rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {dish.category}
          </span>
        )}

        {dish.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {dish.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            href={`/parametres/plats/${dish.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
          >
            <Pencil aria-hidden="true" />
            Modifier
          </Link>
          <DeleteDishButton id={dish.id} name={dish.name} />
        </div>
      </div>
    </div>
  );
}

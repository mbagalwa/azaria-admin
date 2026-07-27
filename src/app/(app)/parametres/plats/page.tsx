import { Suspense } from "react";
import Link from "next/link";
import { Plus, UtensilsCrossed } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DishCard } from "@/components/admin/dish-card";
import { getToken } from "@/lib/auth";
import { listDishes } from "@/lib/dishes";

export const metadata = { title: "Plats" };

export default function ParametresPlatsPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Plats
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Le catalogue des plats vendables.
          </p>
        </div>
        <Link
          href="/parametres/plats/nouveau"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus aria-hidden="true" />
          Ajouter un plat
        </Link>
      </header>

      <Suspense fallback={<DishGridSkeleton />}>
        <DishGrid />
      </Suspense>
    </div>
  );
}

async function DishGrid() {
  const token = await getToken();
  const res = token ? await listDishes(token) : null;
  const dishes = res?.ok ? res.data : [];
  const error = res && !res.ok ? res.message : null;

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <UtensilsCrossed className="size-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Aucun plat pour l&apos;instant
          </p>
          <p className="text-sm text-muted-foreground">
            Ajoutez votre premier plat au catalogue.
          </p>
        </div>
        <Link
          href="/parametres/plats/nouveau"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus aria-hidden="true" />
          Ajouter un plat
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {dishes.length} plat{dishes.length > 1 ? "s" : ""} au catalogue.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}

/** Skeleton de la grille (affiché pendant le chargement via l'API). */
function DishGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-1 h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

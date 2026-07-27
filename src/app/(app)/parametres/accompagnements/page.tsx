import { Suspense } from "react";
import { Salad } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AccompanimentDialog } from "@/components/admin/accompaniment-dialog";
import { DeleteAccompanimentButton } from "@/components/admin/delete-accompaniment-button";
import { getToken } from "@/lib/auth";
import { formatUsd, listAccompaniments } from "@/lib/accompaniments";

export const metadata = { title: "Accompagnements" };

export default function ParametresAccompagnementsPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Accompagnements
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Ce qui accompagne les plats du jour. Un supplément à 0 $ est inclus
            dans le prix du plat.
          </p>
        </div>
        <AccompanimentDialog />
      </header>

      <Suspense fallback={<ListSkeleton />}>
        <List />
      </Suspense>
    </div>
  );
}

async function List() {
  const token = await getToken();
  const res = token ? await listAccompaniments(token) : null;
  const items = res?.ok ? res.data : [];
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

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Salad className="size-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Aucun accompagnement
          </p>
          <p className="text-sm text-muted-foreground">
            Riz, banane plantain, fufu… créez-les une fois, réutilisez-les
            partout.
          </p>
        </div>
        <AccompanimentDialog />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {items.length} accompagnement{items.length > 1 ? "s" : ""} au catalogue.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Salad className="size-5" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-medium text-foreground">
                  {item.name}
                </h3>
                <span
                  className={
                    item.priceCents > 0
                      ? "shrink-0 text-sm font-semibold text-primary"
                      : "shrink-0 text-xs font-medium text-muted-foreground"
                  }
                >
                  {item.priceCents > 0 ? `+ ${formatUsd(item.priceCents)}` : "Inclus"}
                </span>
              </div>

              {item.description && (
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
              {!item.isAvailable && (
                <span className="w-fit rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-medium text-background">
                  Indisponible
                </span>
              )}

              <div className="mt-auto flex items-center gap-2 pt-1">
                <AccompanimentDialog accompaniment={item} />
                <DeleteAccompanimentButton id={item.id} name={item.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton de la liste (affiché pendant le chargement via l'API). */
function ListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-3">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

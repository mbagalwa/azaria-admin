import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton d'un formulaire de réglages (affiché pendant le chargement API). */
export function SettingsFormSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="max-w-2xl space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end border-t border-border pt-4">
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

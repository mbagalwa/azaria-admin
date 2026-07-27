import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramsTable } from "@/components/admin/programs-table";
import { getToken } from "@/lib/auth";
import { listPrograms } from "@/lib/programs";
import { todayISO } from "@/lib/dates";

export const metadata = { title: "Programme" };

export default function ProgrammationPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Programme
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les menus programmés par intervalle de dates.
          </p>
        </div>
        <Link
          href="/programmation/nouveau"
          className={buttonVariants({ size: "lg" })}
        >
          <Plus aria-hidden="true" />
          Nouveau programme
        </Link>
      </header>

      <Suspense fallback={<ProgramsSkeleton />}>
        <ProgramsData />
      </Suspense>
    </div>
  );
}

async function ProgramsData() {
  const token = await getToken();
  const res = token ? await listPrograms(token, { limit: 50 }) : null;
  const programs = res?.ok ? res.data : [];
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

  return <ProgramsTable programs={programs} today={todayISO()} />;
}

function ProgramsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-9 w-64" />
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="size-7 rounded-md" />
          </li>
        ))}
      </ul>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { Pencil, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { ToggleUserButton } from "@/components/admin/toggle-user-button";
import { getCurrentUser, getToken } from "@/lib/auth";
import { listUsers, roleLabel } from "@/lib/users";

export const metadata = { title: "Utilisateurs & rôles" };

/** Avatar illustré DiceBear (placeholder), comme dans la navbar. */
function dicebear(seed: string) {
  return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(seed)}`;
}

export default function ParametresUtilisateursPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Utilisateurs & rôles
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Comptes et accès de l&apos;équipe.
          </p>
        </div>
        <AddUserDialog />
      </header>

      <Suspense fallback={<UserListSkeleton />}>
        <UserList />
      </Suspense>
    </div>
  );
}

async function UserList() {
  const [token, me] = await Promise.all([getToken(), getCurrentUser()]);
  const res = token ? await listUsers(token) : null;
  const users = res?.ok ? res.data : [];
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Users className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Aucun compte pour l&apos;instant.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {users.map((user) => {
        const isSelf = me?.id === user.id;
        const name = user.fullName ?? user.email;
        return (
          <li
            key={user.id}
            className="flex flex-wrap items-center gap-3 p-3 sm:p-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dicebear(user.email)}
              alt=""
              className="size-10 shrink-0 rounded-full bg-muted"
            />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                {name}
                {isSelf && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary">
                    Vous
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>

            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {roleLabel(user.role)}
            </span>

            <span
              className={
                user.isActive
                  ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                  : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              }
            >
              {user.isActive ? "Actif" : "Désactivé"}
            </span>

            <div className="flex items-center gap-1">
              {!isSelf && (
                <ToggleUserButton
                  id={user.id}
                  isActive={user.isActive}
                  label={name}
                />
              )}
              <Link
                href={`/parametres/utilisateurs/${user.id}`}
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={`Modifier ${name}`}
                title="Modifier"
              >
                <Pencil aria-hidden="true" />
              </Link>
              {!isSelf && <DeleteUserButton id={user.id} label={name} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Skeleton de la liste (affiché pendant le chargement via l'API). */
function UserListSkeleton() {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 p-3 sm:p-4">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="size-7 rounded-md" />
        </li>
      ))}
    </ul>
  );
}

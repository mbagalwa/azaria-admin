"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STAFF_ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { StaffUser } from "@/lib/users";
import type { UserFormState } from "@/app/(app)/parametres/utilisateurs/actions";

type Props = {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  user?: StaffUser;
  submitLabel: string;
  /** Vrai si l'admin édite son propre compte (rôle/activation verrouillés). */
  isSelf?: boolean;
  /** Appelé quand l'action réussit (ferme le modal, par ex.). */
  onSuccess?: () => void;
  /** Si fourni, « Annuler » exécute ceci au lieu de naviguer (mode modal). */
  onCancel?: () => void;
  /** Retire la carte englobante (le modal fournit déjà le cadre). */
  bare?: boolean;
};

const initialState: UserFormState = {};

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15 disabled:opacity-50";

export function UserForm({
  action,
  user,
  submitLabel,
  isSelf,
  onSuccess,
  onCancel,
  bare,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values;
  const isEdit = Boolean(user);
  const roleDefault = values?.role ?? user?.role ?? "cuisine";

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state.ok, onSuccess]);

  return (
    <form
      action={formAction}
      className={cn(
        !bare && "max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-6",
      )}
    >
      {state.error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Nom complet</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Nadine Kabila"
            defaultValue={values?.fullName ?? user?.fullName ?? ""}
            disabled={pending}
            className="h-10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="nadine@azaria.cd"
            defaultValue={values?.email ?? user?.email ?? ""}
            required
            disabled={pending}
            className="h-10"
          />
        </div>

        {!isEdit && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              minLength={8}
              required
              disabled={pending}
              className="h-10"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Rôle *</Label>
          <select
            id="role"
            name={isSelf ? undefined : "role"}
            defaultValue={roleDefault}
            disabled={isSelf || pending}
            className={fieldClass}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {isSelf && <input type="hidden" name="role" value={roleDefault} />}
        </div>

        {isEdit && (
          <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <input
              type="checkbox"
              name={isSelf ? undefined : "isActive"}
              defaultChecked={values?.isActive ?? user?.isActive ?? true}
              disabled={isSelf || pending}
              className="size-4 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">Compte actif</span>
              <span className="block text-xs text-muted-foreground">
                Décochez pour retirer l&apos;accès sans supprimer le compte.
              </span>
            </span>
            {isSelf && <input type="hidden" name="isActive" value="true" />}
          </label>
        )}

        {isSelf && (
          <p className="text-xs text-muted-foreground">
            Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte.
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            disabled={pending}
          >
            <X aria-hidden="true" />
            Annuler
          </Button>
        ) : (
          <Link
            href="/parametres/utilisateurs"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            <X aria-hidden="true" />
            Annuler
          </Link>
        )}
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

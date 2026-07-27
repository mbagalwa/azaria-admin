"use client";

import { useActionState, useEffect, useState } from "react";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiAccompaniment } from "@/lib/accompaniments";
import type { AccompanimentFormState } from "@/app/(app)/parametres/accompagnements/actions";

type Props = {
  /** Server Action (create, ou update déjà lié à l'id). */
  action: (
    state: AccompanimentFormState,
    formData: FormData,
  ) => Promise<AccompanimentFormState>;
  /** Accompagnement existant en mode édition (préremplissage). */
  accompaniment?: ApiAccompaniment;
  submitLabel: string;
  onCancel: () => void;
  onSuccess: () => void;
};

const initialState: AccompanimentFormState = {};

/** Formulaire d'accompagnement, rendu dans un modal (création comme édition). */
export function AccompanimentForm({
  action,
  accompaniment,
  submitLabel,
  onCancel,
  onSuccess,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values;
  const [preview, setPreview] = useState<string | null>(
    accompaniment?.imageUrl ?? null,
  );

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : (accompaniment?.imageUrl ?? null));
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="flex gap-4">
        <label
          className={cn(
            "relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 transition-colors hover:border-ring/50 hover:bg-muted",
            preview && "border-solid",
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Aperçu"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
          )}
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPickImage}
            disabled={pending}
            className="sr-only"
          />
        </label>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-name">Nom *</Label>
            <Input
              id="acc-name"
              name="name"
              placeholder="Riz blanc"
              defaultValue={values?.name ?? accompaniment?.name ?? ""}
              required
              disabled={pending}
              className="h-10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="acc-price">Supplément (USD)</Label>
            <Input
              id="acc-price"
              name="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={
                values?.price ??
                (accompaniment ? (accompaniment.priceCents / 100).toFixed(2) : "")
              }
              disabled={pending}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Laissez à 0 si l&apos;accompagnement est inclus dans le prix du plat.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="acc-description">Description</Label>
        <textarea
          id="acc-description"
          name="description"
          rows={2}
          placeholder="Riz parfumé nature"
          defaultValue={values?.description ?? accompaniment?.description ?? ""}
          disabled={pending}
          className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15 disabled:opacity-50"
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={values?.isAvailable ?? accompaniment?.isAvailable ?? true}
          disabled={pending}
          className="size-4 accent-primary"
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium">Disponible</span>
          <span className="block text-xs text-muted-foreground">
            Décochez pour le retirer des menus sans le supprimer.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={pending}>
          <X aria-hidden="true" />
          Annuler
        </Button>
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

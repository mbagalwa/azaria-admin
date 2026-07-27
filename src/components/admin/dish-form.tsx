"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ApiDish } from "@/lib/dishes";
import type { DishFormState } from "@/app/(app)/parametres/plats/actions";

type Props = {
  /** Server Action (create, ou update déjà lié à l'id). */
  action: (state: DishFormState, formData: FormData) => Promise<DishFormState>;
  /** Plat existant en mode édition (préremplissage). */
  dish?: ApiDish;
  submitLabel: string;
};

const initialState: DishFormState = {};

export function DishForm({ action, dish, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values;
  const [preview, setPreview] = useState<string | null>(dish?.imageUrl ?? null);

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : dish?.imageUrl ?? null);
  }

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {state.error && (
        <p
          role="alert"
          className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_1fr]">
        {/* Colonne image */}
        <div className="space-y-2">
          <Label>Image</Label>
          <label
            className={cn(
              "relative flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 transition-colors hover:border-ring/50 hover:bg-muted",
              preview && "border-solid",
            )}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Aperçu du plat"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-1.5 text-muted-foreground">
                <ImagePlus className="size-6" aria-hidden="true" />
                <span className="text-xs font-medium">Choisir une image</span>
              </span>
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
          <p className="text-xs text-muted-foreground">
            PNG, JPG ou WEBP - 5 Mo max.
          </p>
        </div>

        {/* Colonne champs */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom du plat *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Poulet braisé"
              defaultValue={values?.name ?? dish?.name ?? ""}
              required
              disabled={pending}
              className="h-10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Prix (USD) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="12.00"
                defaultValue={
                  values?.price ??
                  (dish ? (dish.priceCents / 100).toFixed(2) : "")
                }
                required
                disabled={pending}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                name="category"
                placeholder="Plats, Accompagnements…"
                defaultValue={values?.category ?? dish?.category ?? ""}
                disabled={pending}
                className="h-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Mariné aux épices, braisé au feu de bois…"
              defaultValue={values?.description ?? dish?.description ?? ""}
              disabled={pending}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/15 disabled:opacity-50"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={values?.isAvailable ?? dish?.isAvailable ?? true}
              disabled={pending}
              className="size-4 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">Disponible à la vente</span>
              <span className="block text-xs text-muted-foreground">
                Décochez pour marquer le plat comme épuisé.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
        <Link
          href="/parametres/plats"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <X aria-hidden="true" />
          Annuler
        </Link>
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

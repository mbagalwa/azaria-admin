"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircle2, Clock, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveRestaurantAction,
  type SettingsFormState,
} from "@/app/(app)/parametres/restaurant/actions";
import type { RestaurantSettings } from "@/lib/settings";

type ServiceRow = { id: number; name: string; cutoff: string };

const initialState: SettingsFormState = {};

export function RestaurantForm({ settings }: { settings: RestaurantSettings }) {
  const [state, formAction, pending] = useActionState(
    saveRestaurantAction,
    initialState,
  );

  const [services, setServices] = useState<ServiceRow[]>(() =>
    settings.services.map((s, i) => ({ id: i, ...s })),
  );
  const nextId = useRef(settings.services.length);

  function addService() {
    setServices((rows) => [
      ...rows,
      { id: nextId.current++, name: "", cutoff: "" },
    ]);
  }
  function removeService(id: number) {
    setServices((rows) => rows.filter((r) => r.id !== id));
  }
  function updateService(id: number, patch: Partial<ServiceRow>) {
    setServices((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  return (
    <form
      action={formAction}
      className="max-w-3xl space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Réglages enregistrés.
        </p>
      )}

      {/* Coordonnées */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">
          Coordonnées
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" name="phone" defaultValue={settings.phone} placeholder="+243 …" />
          <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp} placeholder="+243 …" />
          <Field label="Email" name="email" type="email" defaultValue={settings.email} placeholder="contact@azaria.cd" />
          <Field label="Ville" name="city" defaultValue={settings.city} placeholder="Goma" />
        </div>
        <Field label="Adresse" name="address" defaultValue={settings.address} placeholder="Av. …, quartier …" />
        <Field label="Horaires" name="hours" defaultValue={settings.hours} placeholder="Lun–Sam 10:00–22:00" />
      </fieldset>

      {/* Commande & livraison */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-foreground">
          Commande & livraison
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">Code devise</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue={settings.currency}
              disabled={pending}
              className="h-10 uppercase"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="deliveryFee">Frais de livraison (USD)</Label>
            <Input
              id="deliveryFee"
              name="deliveryFee"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="2.00"
              defaultValue={(settings.deliveryFeeCents / 100).toFixed(2)}
              disabled={pending}
              className="h-10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="orderCutoff">Heure limite de commande</Label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="orderCutoff"
                name="orderCutoff"
                type="time"
                defaultValue={settings.orderCutoff}
                disabled={pending}
                className="h-10 pl-8"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Passé cette heure, on ne prend plus de commande pour le jour même
          (heure de Goma). Les frais s&apos;ajoutent au total des livraisons
          (0 = gratuit).
        </p>
      </fieldset>

      {/* Services (indicatif) */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          Services (indicatif)
        </legend>
        <p className="text-xs text-muted-foreground">
          Repères d&apos;organisation (déjeuner, dîner…). L&apos;heure limite qui
          s&apos;applique réellement aux commandes est celle ci-dessus.
        </p>

        {services.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
            Aucun service défini.
          </p>
        )}

        <div className="space-y-2">
          {services.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                name="serviceName"
                value={row.name}
                onChange={(e) => updateService(row.id, { name: e.target.value })}
                placeholder="Déjeuner"
                disabled={pending}
                className="h-10 flex-1"
              />
              <div className="relative w-36">
                <Clock className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  name="serviceCutoff"
                  type="time"
                  value={row.cutoff}
                  onChange={(e) => updateService(row.id, { cutoff: e.target.value })}
                  disabled={pending}
                  className="h-10 pl-8"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeService(row.id)}
                aria-label="Retirer ce service"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addService}
          disabled={pending}
        >
          <Plus aria-hidden="true" />
          Ajouter un service
        </Button>
      </fieldset>

      <div className="flex items-center justify-end border-t border-border pt-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/** Champ texte simple, non contrôlé (defaultValue). */
function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="h-10"
      />
    </div>
  );
}

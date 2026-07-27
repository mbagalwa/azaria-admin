"use client";

import { useActionState, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  saveNotificationsAction,
  type SettingsFormState,
} from "@/app/(app)/parametres/notifications/actions";
import type { NotificationsSettings } from "@/lib/settings";

const initialState: SettingsFormState = {};

export function NotificationsForm({
  settings,
}: {
  settings: NotificationsSettings;
}) {
  const [state, formAction, pending] = useActionState(
    saveNotificationsAction,
    initialState,
  );
  const [form, setForm] = useState<NotificationsSettings>(settings);

  const set = <K extends keyof NotificationsSettings>(
    key: K,
    value: NotificationsSettings[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-6 rounded-xl border border-border bg-card p-5 sm:p-6"
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

      {/* Canaux */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">Canaux</legend>

        <Toggle
          name="emailEnabled"
          checked={form.emailEnabled}
          onChange={(v) => set("emailEnabled", v)}
          disabled={pending}
          icon={<Mail className="size-4" aria-hidden="true" />}
          title="Email"
          description="Envoyer des emails transactionnels aux clients."
        />
        {form.emailEnabled && (
          <div className="ml-1 flex flex-col gap-2 pl-3">
            <Label htmlFor="senderEmail">Email expéditeur</Label>
            <Input
              id="senderEmail"
              name="senderEmail"
              type="email"
              value={form.senderEmail ?? ""}
              onChange={(e) => set("senderEmail", e.target.value)}
              placeholder="commandes@azaria.cd"
              disabled={pending}
              className="h-10 max-w-sm"
            />
          </div>
        )}

        <Toggle
          name="whatsappEnabled"
          checked={form.whatsappEnabled}
          onChange={(v) => set("whatsappEnabled", v)}
          disabled={pending}
          icon={<MessageCircle className="size-4" aria-hidden="true" />}
          title="WhatsApp (client)"
          description="Accusé de réception et suivi de statut envoyés au client. C'est son seul canal : il n'a pas de compte."
        />
        {form.whatsappEnabled && (
          <div className="ml-1 space-y-4 pl-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="whatsappNumber">
                Numéro WhatsApp de l&apos;équipe
              </Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                value={form.whatsappNumber ?? ""}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                placeholder="+243 991 234 567"
                disabled={pending}
                className="h-10 max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                Reçoit une alerte à chaque nouvelle commande. Laissez vide pour
                ne notifier que Telegram.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsappTemplateOrderReceived">
                  Template « commande reçue »
                </Label>
                <Input
                  id="whatsappTemplateOrderReceived"
                  name="whatsappTemplateOrderReceived"
                  value={form.whatsappTemplateOrderReceived ?? ""}
                  onChange={(e) =>
                    set("whatsappTemplateOrderReceived", e.target.value)
                  }
                  placeholder="azaria_commande_recue"
                  disabled={pending}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsappTemplateStatusChange">
                  Template « changement de statut »
                </Label>
                <Input
                  id="whatsappTemplateStatusChange"
                  name="whatsappTemplateStatusChange"
                  value={form.whatsappTemplateStatusChange ?? ""}
                  onChange={(e) =>
                    set("whatsappTemplateStatusChange", e.target.value)
                  }
                  placeholder="azaria_suivi_commande"
                  disabled={pending}
                  className="h-10"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Meta n&apos;autorise le message libre que dans les 24 h suivant le
              dernier message du client. Renseignez ici le nom de vos templates
              approuvés pour que les envois passent en toutes circonstances.
            </p>
          </div>
        )}

        <Toggle
          name="telegramEnabled"
          checked={form.telegramEnabled}
          onChange={(v) => set("telegramEnabled", v)}
          disabled={pending}
          icon={<Send className="size-4" aria-hidden="true" />}
          title="Telegram (équipe)"
          description="Alerte interne à chaque nouvelle commande, dans un chat ou un groupe."
        />
        {form.telegramEnabled && (
          <div className="ml-1 flex flex-col gap-2 pl-3">
            <Label htmlFor="telegramChatId">Identifiant du chat</Label>
            <Input
              id="telegramChatId"
              name="telegramChatId"
              value={form.telegramChatId ?? ""}
              onChange={(e) => set("telegramChatId", e.target.value)}
              placeholder="-1001234567890"
              disabled={pending}
              className="h-10 max-w-sm"
            />
            <p className="text-xs text-muted-foreground">
              Démarrez une conversation avec le bot, puis récupérez le{" "}
              <code className="rounded bg-muted px-1">chat.id</code> via
              getUpdates. Un identifiant de groupe commence par un tiret.
            </p>
          </div>
        )}
      </fieldset>

      {/* Déclencheurs */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          Déclencheurs
        </legend>
        <Toggle
          name="notifyNewOrder"
          checked={form.notifyNewOrder}
          onChange={(v) => set("notifyNewOrder", v)}
          disabled={pending}
          title="Nouvelle commande"
          description="Alerte l'équipe (Telegram et WhatsApp) à chaque commande reçue."
        />
        <Toggle
          name="notifyStatusChange"
          checked={form.notifyStatusChange}
          onChange={(v) => set("notifyStatusChange", v)}
          disabled={pending}
          title="Changement de statut"
          description="Prévient le client quand sa commande avance (confirmée, prête…)."
        />
      </fieldset>

      <p className="text-xs text-muted-foreground">
        Les identifiants des fournisseurs (jeton Meta, bot Telegram) vivent dans
        le fichier <code className="rounded bg-muted px-1">.env</code> de
        l&apos;API. Tant qu&apos;ils sont absents, les envois sont journalisés
        sans partir.
      </p>

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

/** Ligne interrupteur : checkbox caché (nom soumis) + rendu switch. */
function Toggle({
  name,
  checked,
  onChange,
  disabled,
  title,
  description,
  icon,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      {/* Checkbox réel (inclus dans le FormData si coché). */}
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-background transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          {icon}
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

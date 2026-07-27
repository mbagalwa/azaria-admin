"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmResult = { error?: string } | void;

type Props = {
  /** Élément déclencheur (ex. un <Button>). */
  trigger: React.ReactElement;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style destructif pour le bouton de confirmation. */
  destructive?: boolean;
  /**
   * Action exécutée à la confirmation. Renvoyer `{ error }` laisse le modal
   * ouvert et affiche l'erreur ; sinon le modal se ferme.
   */
  onConfirm: () => Promise<ConfirmResult>;
};

/**
 * Modal de confirmation réutilisable, en remplacement de `window.confirm`.
 * Pendant l'exécution : boutons désactivés + spinner, fermeture bloquée.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (pending) return; // pas de fermeture en cours d'action
    setOpen(next);
    if (!next) setError(null);
  }

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await onConfirm();
      if (res?.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-sm" showClose={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => handleOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            size="lg"
            onClick={handleConfirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

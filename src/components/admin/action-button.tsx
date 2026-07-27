"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  /** Action asynchrone (server action). Le bouton reste en attente jusqu'au retour. */
  onAction: () => Promise<unknown>;
};

/**
 * Bouton qui déclenche une action asynchrone : pendant l'attente de l'API, il
 * est désactivé et affiche un spinner (remplace son contenu). Anti double-clic.
 */
export function ActionButton({ onAction, children, disabled, ...props }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={disabled || pending}
      aria-busy={pending}
      onClick={() => startTransition(async () => { await onAction(); })}
      {...props}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : children}
    </Button>
  );
}

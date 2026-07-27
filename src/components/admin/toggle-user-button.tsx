"use client";

import { Power } from "lucide-react";
import { ActionButton } from "@/components/admin/action-button";
import { toggleUserActiveAction } from "@/app/(app)/parametres/utilisateurs/actions";

/** Active/désactive un compte, avec spinner pendant l'appel API. */
export function ToggleUserButton({
  id,
  isActive,
  label,
}: {
  id: number;
  isActive: boolean;
  label: string;
}) {
  return (
    <ActionButton
      variant="ghost"
      size="icon-sm"
      aria-label={
        isActive ? `Désactiver ${label}` : `Activer ${label}`
      }
      title={isActive ? "Désactiver" : "Activer"}
      onAction={() => toggleUserActiveAction(id, !isActive)}
    >
      <Power aria-hidden="true" />
    </ActionButton>
  );
}

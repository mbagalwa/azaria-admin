"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteUserAction } from "@/app/(app)/parametres/utilisateurs/actions";

/** Suppression d'un compte, confirmée via un modal maison. */
export function DeleteUserButton({ id, label }: { id: number; label: string }) {
  return (
    <ConfirmDialog
      title={`Supprimer ${label} ?`}
      description="Le compte et son accès seront définitivement supprimés."
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => deleteUserAction(id)}
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Supprimer ${label}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      }
    />
  );
}

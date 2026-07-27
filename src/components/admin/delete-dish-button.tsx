"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteDishAction } from "@/app/(app)/parametres/plats/actions";

/** Suppression d'un plat, confirmée via un modal maison. */
export function DeleteDishButton({ id, name }: { id: number; name: string }) {
  return (
    <ConfirmDialog
      title={`Supprimer « ${name} » ?`}
      description="Cette action est définitive et retire aussi l'image du plat."
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => deleteDishAction(id)}
      trigger={
        <Button variant="destructive" size="sm" aria-label={`Supprimer ${name}`}>
          <Trash2 aria-hidden="true" />
          Supprimer
        </Button>
      }
    />
  );
}

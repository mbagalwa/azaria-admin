"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteAccompanimentAction } from "@/app/(app)/parametres/accompagnements/actions";

/** Suppression d'un accompagnement, confirmée via un modal maison. */
export function DeleteAccompanimentButton({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  return (
    <ConfirmDialog
      title={`Supprimer « ${name} » ?`}
      description="Il sera retiré des programmes qui le proposent. Les commandes déjà passées gardent leur libellé et leur prix."
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => deleteAccompanimentAction(id)}
      trigger={
        <Button variant="destructive" size="sm" aria-label={`Supprimer ${name}`}>
          <Trash2 aria-hidden="true" />
        </Button>
      }
    />
  );
}

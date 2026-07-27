"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteProgramAction } from "@/app/(app)/programmation/actions";

/** Suppression d'un programme, confirmée via un modal maison. */
export function DeleteProgramButton({
  id,
  label,
}: {
  id: number;
  label: string;
}) {
  return (
    <ConfirmDialog
      title={`Supprimer « ${label} » ?`}
      description="Le programme et toutes ses assignations de plats seront supprimés."
      confirmLabel="Supprimer"
      destructive
      onConfirm={() => deleteProgramAction(id)}
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

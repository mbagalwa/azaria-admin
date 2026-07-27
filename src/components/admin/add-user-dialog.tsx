"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/admin/user-form";
import { createUserAction } from "@/app/(app)/parametres/utilisateurs/actions";

/** Bouton « Ajouter un utilisateur » ouvrant le formulaire de création en modal. */
export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="lg">
            <Plus aria-hidden="true" />
            Ajouter un utilisateur
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Créez un compte pour un membre de l&apos;équipe.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          action={createUserAction}
          submitLabel="Créer le compte"
          bare
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

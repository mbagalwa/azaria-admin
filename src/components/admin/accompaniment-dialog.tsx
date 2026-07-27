"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AccompanimentForm } from "@/components/admin/accompaniment-form";
import {
  createAccompanimentAction,
  updateAccompanimentAction,
} from "@/app/(app)/parametres/accompagnements/actions";
import type { ApiAccompaniment } from "@/lib/accompaniments";

/**
 * Création et édition d'un accompagnement dans un même modal : sans
 * `accompaniment` c'est une création, avec c'est une édition.
 */
export function AccompanimentDialog({
  accompaniment,
}: {
  accompaniment?: ApiAccompaniment;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const editing = Boolean(accompaniment);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          editing ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              aria-label={`Modifier ${accompaniment!.name}`}
            >
              <Pencil aria-hidden="true" />
              Modifier
            </Button>
          ) : (
            <Button size="lg">
              <Plus aria-hidden="true" />
              Ajouter un accompagnement
            </Button>
          )
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? accompaniment!.name : "Nouvel accompagnement"}
          </DialogTitle>
          <DialogDescription>
            Il pourra ensuite être proposé avec les plats du jour, depuis la
            programmation.
          </DialogDescription>
        </DialogHeader>
        {/* `key` force un formulaire neuf à chaque ouverture (état useActionState). */}
        <AccompanimentForm
          key={open ? "open" : "closed"}
          action={
            editing
              ? updateAccompanimentAction.bind(null, accompaniment!.id)
              : createAccompanimentAction
          }
          accompaniment={accompaniment}
          submitLabel={editing ? "Enregistrer" : "Créer"}
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

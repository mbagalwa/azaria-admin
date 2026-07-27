import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DishForm } from "@/components/admin/dish-form";
import { createDishAction } from "../actions";

export const metadata = { title: "Nouveau plat" };

export default function NouveauPlatPage() {
  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/parametres/plats"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour aux plats
        </Link>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
          Nouveau plat
        </h2>
      </div>

      <DishForm action={createDishAction} submitLabel="Créer le plat" />
    </div>
  );
}

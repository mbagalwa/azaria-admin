import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DishForm } from "@/components/admin/dish-form";
import { getToken } from "@/lib/auth";
import { getDish } from "@/lib/dishes";
import { updateDishAction } from "../actions";

export const metadata = { title: "Modifier un plat" };

export default async function EditPlatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();
  const res = token ? await getDish(id, token) : null;

  if (!res || !res.ok) {
    notFound();
  }

  const dish = res.data;

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
          Modifier « {dish.name} »
        </h2>
      </div>

      <DishForm
        action={updateDishAction.bind(null, dish.id)}
        dish={dish}
        submitLabel="Enregistrer"
      />
    </div>
  );
}

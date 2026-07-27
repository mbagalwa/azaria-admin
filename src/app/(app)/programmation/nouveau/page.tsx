import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramBuilder } from "@/components/admin/program-builder";
import { getToken } from "@/lib/auth";
import { listDishes } from "@/lib/dishes";
import { listPrograms } from "@/lib/programs";

export const metadata = { title: "Nouveau programme" };

export default async function NouveauProgrammePage() {
  const token = await getToken();
  const [dishesRes, programsRes] = await Promise.all([
    token ? listDishes(token) : Promise.resolve(null),
    token ? listPrograms(token, { limit: 100 }) : Promise.resolve(null),
  ]);

  const dishes = (dishesRes?.ok ? dishesRes.data : []).map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    imageUrl: d.imageUrl,
    isAvailable: d.isAvailable,
    priceCents: d.priceCents,
  }));
  const existingPrograms = (programsRes?.ok ? programsRes.data : []).map((p) => ({
    id: p.id,
    code: p.code,
    title: p.title,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/programmation"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour aux programmes
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Nouveau programme
        </h1>
      </div>

      <ProgramBuilder
        mode="create"
        dishes={dishes}
        existingPrograms={existingPrograms}
      />
    </div>
  );
}

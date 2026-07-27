import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProgramBuilder } from "@/components/admin/program-builder";
import { getToken } from "@/lib/auth";
import { listDishes } from "@/lib/dishes";
import { getProgram, listPrograms } from "@/lib/programs";

export const metadata = { title: "Modifier le programme" };

export default async function ModifierProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();

  const [progRes, dishesRes, programsRes] = await Promise.all([
    token ? getProgram(id, token) : Promise.resolve(null),
    token ? listDishes(token) : Promise.resolve(null),
    token ? listPrograms(token, { limit: 100 }) : Promise.resolve(null),
  ]);

  if (!progRes || !progRes.ok) {
    notFound();
  }
  const program = progRes.data;

  const dishes = (dishesRes?.ok ? dishesRes.data : []).map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    imageUrl: d.imageUrl,
    isAvailable: d.isAvailable,
    priceCents: d.priceCents,
  }));
  const existingPrograms = (programsRes?.ok ? programsRes.data : [])
    .filter((p) => p.id !== program.id)
    .map((p) => ({
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
          href={`/programmation/${program.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour au programme
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Modifier le programme
        </h1>
      </div>

      <ProgramBuilder
        mode="edit"
        dishes={dishes}
        existingPrograms={existingPrograms}
        program={{
          id: program.id,
          title: program.title,
          description: program.description,
          startDate: program.startDate,
          endDate: program.endDate,
          days: program.days.map((d) => ({
            date: d.date,
            dishes: d.dishes.map((x) => ({ id: x.id, priceCents: x.priceCents })),
          })),
        }}
      />
    </div>
  );
}

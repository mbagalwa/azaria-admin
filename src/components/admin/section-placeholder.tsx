/** Contenu provisoire d'une section pas encore construite. */
export function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">Module à venir.</p>
      </div>
    </div>
  );
}

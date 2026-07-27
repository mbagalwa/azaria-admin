/** Petits graphiques SVG maison (sans lib), thème-aware via les tokens CSS. */

/** Palette de segments (le 1er = primaire de marque). */
const PALETTE = [
  "var(--primary)",
  "#10b981",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export type BarDatum = {
  /** Libellé principal sous la barre (ici : le numéro du jour). */
  label: string;
  /** Libellé secondaire, plus discret (ici : l'initiale du jour de semaine). */
  sublabel?: string;
  /** Texte du survol — sans lui, une barre nue ne dit pas ce qu'elle vaut. */
  title?: string;
  value: number;
};

/** Au-delà, une valeur sur chaque barre devient du bruit : seul le pic est chiffré. */
const DENSE_THRESHOLD = 10;

/**
 * Marge haute réservée à l'étiquette de la barre la plus haute (px). Sans elle,
 * la valeur d'une barre à 100 % se poserait hors du cadre, sur le titre de la
 * carte. Appliquée À LA FOIS aux graduations et aux barres pour qu'elles
 * partagent le même repère.
 */
const LABEL_HEADROOM = 16;

/**
 * Histogramme vertical à série unique.
 *
 * En HTML/CSS plutôt qu'en SVG : les barres se partagent la largeur disponible
 * (`flex-1`), donc le graphique suit la colonne sans viewBox ni défilement, et
 * le texte reste net à toutes les tailles. Une seule série ⇒ une seule teinte
 * (`--primary`) et pas de légende : le titre de la carte nomme la mesure. La
 * couleur ne distingue JAMAIS le maximum — sinon elle encoderait le rang.
 */
export function BarChart({
  data,
  height = 150,
}: {
  data: BarDatum[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Aucun accompagnement n&apos;est proposé sur cet intervalle.
      </p>
    );
  }

  /** Échelle : 0, le maximum, et un palier intermédiaire s'il y a la place. */
  const ticks = max >= 4 ? [max, Math.round(max / 2), 0] : [max, 0];
  const labelAll = data.length <= DENSE_THRESHOLD;

  return (
    <figure className="flex gap-2">
      {/* Graduations — même marge haute que le tracé, sinon elles décalent */}
      <div
        className="relative w-4 shrink-0"
        style={{ height }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ top: LABEL_HEADROOM }}
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
              style={{ bottom: `${(t / max) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ top: LABEL_HEADROOM }}
          >
            {/* Repères horizontaux, volontairement effacés */}
            {ticks.map((t) => (
              <span
                key={t}
                aria-hidden="true"
                className={
                  t === 0
                    ? "absolute inset-x-0 border-t border-border"
                    : "absolute inset-x-0 border-t border-dashed border-border/60"
                }
                style={{ bottom: `${(t / max) * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-0.75">
              {data.map((d, i) => {
                const pct = (d.value / max) * 100;
                const showValue = labelAll ? d.value > 0 : d.value === max;
                return (
                  <div key={i} className="group relative h-full flex-1">
                    {/* Zone de survol : toute la colonne, pas seulement la barre */}
                    <span
                      className="absolute inset-0 rounded-sm transition-colors group-hover:bg-muted/50"
                      title={`${d.title ?? d.label} — ${d.value}`}
                    />
                    {showValue && (
                      <span
                        className="pointer-events-none absolute inset-x-0 text-center text-[10px] font-semibold tabular-nums text-foreground"
                        style={{ bottom: `calc(${pct}% + 3px)` }}
                      >
                        {d.value}
                      </span>
                    )}
                    {d.value > 0 ? (
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 rounded-t bg-primary opacity-90 transition-opacity group-hover:opacity-100"
                        style={{ height: `${pct}%` }}
                      />
                    ) : (
                      /* Un zéro doit se voir : sans ce trait, le jour semblerait absent. */
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-muted-foreground/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Axe des jours */}
        <div className="mt-1.5 flex gap-0.75">
          {data.map((d, i) => (
            <div key={i} className="min-w-0 flex-1 text-center leading-tight">
              {d.sublabel && (
                <span className="block truncate text-[9px] uppercase text-muted-foreground/70">
                  {d.sublabel}
                </span>
              )}
              <span className="block truncate text-[10px] tabular-nums text-muted-foreground">
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Équivalent textuel : le graphique n'est pas la seule voie d'accès. */}
      <figcaption className="sr-only">
        Accompagnements par jour :{" "}
        {data.map((d) => `${d.title ?? d.label} : ${d.value}`).join(", ")}.
      </figcaption>
    </figure>
  );
}

/** Donut en anneau (technique stroke-dasharray) + légende. */
export function DonutChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const rho = 42;
  const sw = 18;
  const circumference = 2 * Math.PI * rho;

  const lens = data.map((d) => (d.value / total) * circumference);
  const segments = data.map((d, i) => ({
    ...d,
    len: lens[i],
    offset: lens.slice(0, i).reduce((a, b) => a + b, 0),
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="flex items-center gap-5">
      <svg width={120} height={120} viewBox="0 0 120 120" className="shrink-0">
        <g transform="rotate(-90 60 60)">
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={60}
              cy={60}
              r={rho}
              fill="none"
              stroke={s.color}
              strokeWidth={sw}
              strokeDasharray={`${s.len} ${circumference - s.len}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </g>
        <text
          x={60}
          y={60}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={700}
          fill="var(--foreground)"
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold text-foreground">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

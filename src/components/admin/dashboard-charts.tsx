/**
 * Graphiques du tableau de bord — SVG maison, rendus côté serveur (pas de hook),
 * thème-aware via les tokens CSS. Même esprit que `program-charts.tsx`.
 */
import { formatUsd } from "@/lib/format";

export type DonutSegment = { label: string; value: number; color: string };

/** Arrondit à un plafond « propre » (1/2/5 × 10ⁿ) au-dessus de la valeur. */
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}

/** Donut en anneau (stroke-dasharray) + légende. Segments à 0 masqués. */
export function StatusDonut({
  segments,
  centerLabel = "commandes",
}: {
  segments: DonutSegment[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  const shown = segments.filter((s) => s.value > 0);
  const r = 52;
  const sw = 16;
  const C = 2 * Math.PI * r;
  const gap = total > 0 && shown.length > 1 ? 4 : 0;

  let offset = 0;
  const arcs = shown.map((s) => {
    const frac = s.value / (total || 1);
    const len = Math.max(frac * C - gap, 0.5);
    const arc = { ...s, len, offset };
    offset += frac * C;
    return arc;
  });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={132} height={132} viewBox="0 0 132 132" className="shrink-0">
        <g transform="rotate(-90 66 66)">
          {total === 0 ? (
            <circle
              cx={66}
              cy={66}
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth={sw}
            />
          ) : (
            arcs.map((a, i) => (
              <circle
                key={i}
                cx={66}
                cy={66}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={sw}
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={-a.offset}
              />
            ))
          )}
        </g>
        <text
          x={66}
          y={62}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={700}
          fill="var(--foreground)"
        >
          {total}
        </text>
        <text x={66} y={84} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
          {centerLabel}
        </text>
      </svg>
      <ul className="min-w-40 flex-1 space-y-1 text-sm">
        {shown.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-[3px]"
              style={{ background: s.color }}
            />
            <span className="flex-1 text-muted-foreground">{s.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((s.value / (total || 1)) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Courbe de CA (aire + ligne), point final mis en avant. Montants en centimes. */
export function CaTrend({
  points,
}: {
  points: { label: string; valueCents: number }[];
}) {
  const W = 520;
  const H = 176;
  const PL = 46;
  const PR = 14;
  const PT = 14;
  const PB = 28;
  const iw = W - PL - PR;
  const ih = H - PT - PB;
  const maxV = Math.max(...points.map((p) => p.valueCents), 0);
  const ceil = niceCeil(maxV);
  const n = points.length;

  const X = (i: number) => PL + (n <= 1 ? iw / 2 : (iw * i) / (n - 1));
  const Y = (v: number) => PT + ih * (1 - v / ceil);

  const line = points.map((p, i) => `${i ? "L" : "M"}${X(i)} ${Y(p.valueCents)}`).join(" ");
  const area = n ? `${line} L${X(n - 1)} ${Y(0)} L${X(0)} ${Y(0)} Z` : "";
  const ticks = [0, ceil / 2, ceil];
  const last = n - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="h-auto" role="img" aria-label="Chiffre d'affaires par jour">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PL} x2={W - PR} y1={Y(t)} y2={Y(t)} stroke="var(--border)" strokeWidth={1} />
          <text x={PL - 8} y={Y(t) + 3} textAnchor="end" fontSize={10} fill="var(--muted-foreground)">
            {formatUsd(t)}
          </text>
        </g>
      ))}
      {points.map((p, i) => (
        <text key={i} x={X(i)} y={H - 9} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
          {p.label}
        </text>
      ))}
      {area && <path d={area} fill="var(--primary)" opacity={0.1} />}
      {n > 1 && <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
      {n > 0 && (
        <>
          <circle cx={X(last)} cy={Y(points[last].valueCents)} r={4.5} fill="var(--primary)" stroke="var(--card)" strokeWidth={2.5} />
          <text
            x={X(last)}
            y={Y(points[last].valueCents) - 10}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill="var(--foreground)"
          >
            {formatUsd(points[last].valueCents)}
          </text>
        </>
      )}
    </svg>
  );
}

/** Barres horizontales (top plats). */
export function TopDishesBars({
  items,
}: {
  items: { name: string; quantity: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.quantity));
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,8rem)_1fr_2.25rem] items-center gap-3"
        >
          <span className="truncate text-sm text-muted-foreground" title={it.name}>
            {it.name}
          </span>
          <span className="relative h-3.5 overflow-hidden rounded bg-muted">
            <span
              className="absolute inset-y-0 left-0 rounded-r bg-primary"
              style={{ width: `${(it.quantity / max) * 100}%` }}
            />
          </span>
          <span className="text-right text-sm font-semibold tabular-nums text-foreground">
            {it.quantity}
          </span>
        </div>
      ))}
    </div>
  );
}

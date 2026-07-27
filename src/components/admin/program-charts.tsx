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

/** Histogramme vertical simple. Défile horizontalement si trop de barres. */
export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = 26;
  const gap = 8;
  const width = data.length * (barW + gap) + gap;

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height + 26}
        role="img"
        aria-label="Plats par jour"
        className="min-w-full"
      >
        {data.map((d, i) => {
          const barH = d.value === 0 ? 3 : Math.max(5, Math.round((d.value / max) * height));
          const x = gap + i * (barW + gap);
          const y = height - barH + 4;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={4}
                fill="var(--primary)"
                opacity={d.value === 0 ? 0.15 : 0.9}
              />
              {d.value > 0 && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {d.value}
                </text>
              )}
              <text
                x={x + barW / 2}
                y={height + 18}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted-foreground)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
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

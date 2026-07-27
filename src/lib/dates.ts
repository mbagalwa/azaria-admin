/**
 * Utilitaires de dates calendaires manipulées en ISO "YYYY-MM-DD".
 * Tout passe par UTC pour éviter les décalages de fuseau. Module neutre.
 */

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export function diffDays(startIso: string, endIso: string): number {
  return Math.round(
    (parseISO(endIso).getTime() - parseISO(startIso).getTime()) / 86_400_000,
  );
}

/** Toutes les dates de l'intervalle [start, end] inclus. */
export function eachDay(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  const n = diffDays(startIso, endIso);
  for (let i = 0; i <= n; i++) out.push(addDays(startIso, i));
  return out;
}

/** Jour de semaine, lundi = 0 … dimanche = 6. */
export function weekdayMon(iso: string): number {
  return (parseISO(iso).getUTCDay() + 6) % 7;
}

export function startOfWeek(iso: string): string {
  return addDays(iso, -weekdayMon(iso));
}

export function endOfWeek(iso: string): string {
  return addDays(iso, 6 - weekdayMon(iso));
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 8)}01`;
}

export function endOfMonth(iso: string): string {
  const d = parseISO(iso);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)));
}

/** Ancre au 1er du mois cible (évite les débordements 31 → mois court). */
export function addMonths(iso: string, n: number): string {
  const d = parseISO(iso);
  return toISO(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
}

/**
 * Conversions pour les composants calendrier (react-day-picker travaille en
 * dates LOCALES à minuit) : ne pas passer par toISOString qui décalerait d'un
 * jour selon le fuseau.
 */
export function fromISOLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISOLocal(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Fuseau métier d'Azaria (Goma, RDC Est) : UTC+2, sans heure d'été. Le « jour
 * courant » se calcule dans ce fuseau, jamais dans celui du serveur Next (souvent
 * UTC) — sinon « aujourd'hui » bascule d'un jour pendant ~2h après minuit local.
 */
export const BUSINESS_TZ = "Africa/Lubumbashi";

const fmtBusinessDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Date du jour (fuseau métier) en ISO "YYYY-MM-DD". */
export function todayISO(): string {
  return fmtBusinessDay.format(new Date());
}

/** Heure courante (fuseau métier) en minutes depuis minuit. */
export function nowMinutesBusiness(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

export function dayNumber(iso: string): number {
  return parseISO(iso).getUTCDate();
}

const fmtLong = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const fmtMonth = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const fmtWeekday = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  timeZone: "UTC",
});

/** "20 juil. 2026" */
export function formatFR(iso: string): string {
  return fmtLong.format(parseISO(iso));
}

export function formatRangeFR(startIso: string, endIso: string): string {
  return `${formatFR(startIso)} – ${formatFR(endIso)}`;
}

/** "juillet 2026" */
export function monthLabelFR(iso: string): string {
  return fmtMonth.format(parseISO(iso));
}

/** "lun." */
export function weekdayShortFR(iso: string): string {
  return fmtWeekday.format(parseISO(iso));
}

export type ProgramStatus = "upcoming" | "active" | "past";

export function programStatus(
  startIso: string,
  endIso: string,
  todayIso: string,
): ProgramStatus {
  if (todayIso < startIso) return "upcoming";
  if (todayIso > endIso) return "past";
  return "active";
}

export const PROGRAM_STATUS_LABEL: Record<ProgramStatus, string> = {
  upcoming: "À venir",
  active: "En cours",
  past: "Terminé",
};

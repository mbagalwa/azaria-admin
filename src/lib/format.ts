/** Formatage neutre (importable côté client comme serveur). */

/** Formate un prix stocké en centimes de dollar → "$12.00". */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

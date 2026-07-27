/**
 * Cover d'un programme via DiceBear (style identicon). Le seed est le code du
 * programme : l'image reste donc identique à chaque rafraîchissement. Neutre.
 */
export function programCover(seed: string): string {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
}

/** Avatar illustré d'un client (style micah, cohérent avec la navbar). */
export function customerAvatar(seed: string): string {
  return `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(seed)}`;
}

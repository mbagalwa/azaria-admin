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

/**
 * Seed d'avatar d'un client sans compte : son numéro WhatsApp (stable, et il
 * identifie la personne d'une commande à l'autre), à défaut son nom.
 */
export function customerSeed(customer: {
  phone: string | null;
  fullName: string;
}): string {
  return customer.phone || customer.fullName;
}

/** Lien « écrire sur WhatsApp » depuis un numéro E.164. */
export function whatsappLink(phone: string | null): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

/** Affichage lisible d'un numéro RDC : +243 991 234 567. */
export function formatPhone(phone: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("243") || digits.length !== 12) return phone;
  const n = digits.slice(3);
  return `+243 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

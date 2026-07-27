/** Statuts, modes et paiement des commandes — module neutre (client/serveur). */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "delivered"
  | "picked_up"
  | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête",
  delivering: "En livraison",
  delivered: "Livrée",
  picked_up: "Récupérée",
  cancelled: "Annulée",
};

/** Classes de badge par statut (fond teinté + texte). */
export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  preparing: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  ready: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  delivering: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  picked_up: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
};

/**
 * Couleurs pleines par statut, pour les graphiques (donut). Palette catégorielle
 * validée pour la lisibilité daltonienne (voir maquette dashboard).
 */
export const ORDER_STATUS_HEX: Record<OrderStatus, string> = {
  pending: "#eda100",
  confirmed: "#2a78d6",
  preparing: "#eb6834",
  ready: "#1baf7a",
  delivering: "#4a3aa7",
  delivered: "#008300",
  picked_up: "#008300",
  cancelled: "#e34948",
};

/** Fond doux des cartes du planning journalier, par statut (façon agenda). */
export const ORDER_STATUS_CARD_CLASS: Record<OrderStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10",
  confirmed: "border-sky-500/30 bg-sky-500/10",
  preparing: "border-violet-500/30 bg-violet-500/10",
  ready: "border-emerald-500/30 bg-emerald-500/10",
  delivering: "border-sky-500/30 bg-sky-500/10",
  delivered: "border-emerald-500/30 bg-emerald-500/10",
  picked_up: "border-emerald-500/30 bg-emerald-500/10",
  cancelled: "border-destructive/30 bg-destructive/5",
};

export type OrderMode = "delivery" | "pickup";

/** Chemins du cycle selon le mode (hors annulation). */
export const ORDER_FLOW: Record<OrderMode, OrderStatus[]> = {
  delivery: ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"],
  pickup: ["pending", "confirmed", "preparing", "ready", "picked_up"],
};

export const TERMINAL_STATUSES: OrderStatus[] = [
  "delivered",
  "picked_up",
  "cancelled",
];

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** Étape suivante dans la suite logique, ou null si terminal. */
export function nextStatus(
  mode: OrderMode,
  status: OrderStatus,
): OrderStatus | null {
  const flow = ORDER_FLOW[mode];
  const idx = flow.indexOf(status);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
}

export const ORDER_MODE_LABEL: Record<OrderMode, string> = {
  delivery: "Livraison",
  pickup: "Retrait",
};

export type PaymentMethod = "cash_on_delivery" | "mobile_money";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash_on_delivery: "À la livraison",
  mobile_money: "Mobile Money",
};

export const PAYMENT_STATUS_LABEL: Record<"unpaid" | "paid", string> = {
  unpaid: "À payer",
  paid: "Payé",
};

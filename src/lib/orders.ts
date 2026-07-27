import "server-only";
import { apiFetch } from "@/lib/api";
import type {
  OrderMode,
  OrderStatus,
  PaymentMethod,
} from "@/lib/order-status";

export type OrderCustomer = {
  id: number;
  fullName: string | null;
  email: string;
  initials: string;
};

export type OrderItemLite = {
  id: number;
  dishId: number | null;
  name: string;
  priceCents: number;
  quantity: number;
};

/** Un jalon de l'historique (timeline). */
export type OrderEventLite = {
  id: number;
  status: OrderStatus;
  createdAt: string;
};

/** Une commande (lignes aux prix figés incluses). */
export type OrderSummary = {
  id: number;
  code: string;
  deliveryDate: string;
  deliveryTime: string;
  mode: OrderMode;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid";
  totalCents: number;
  deliveryFeeCents: number;
  address: string | null;
  note: string | null;
  itemsCount: number;
  items: OrderItemLite[];
  events: OrderEventLite[];
  customer: OrderCustomer;
  createdAt: string;
};

export type OrderDetail = OrderSummary;

export function updateOrderStatus(
  id: string | number,
  status: OrderStatus,
  token: string,
) {
  return apiFetch<OrderSummary>(`/api/v1/orders/${id}/status`, {
    method: "PUT",
    body: { status },
    token,
  });
}

export function updateOrderPayment(
  id: string | number,
  paymentStatus: "paid" | "unpaid",
  token: string,
) {
  return apiFetch<OrderSummary>(`/api/v1/orders/${id}/payment`, {
    method: "PUT",
    body: { paymentStatus },
    token,
  });
}

export function listOrders(
  token: string,
  opts: { from?: string; to?: string; page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);
  if (opts.page) params.set("page", String(opts.page));
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return apiFetch<OrderSummary[]>(`/api/v1/orders${qs ? `?${qs}` : ""}`, {
    token,
  });
}

export function getOrder(id: string | number, token: string) {
  return apiFetch<OrderDetail>(`/api/v1/orders/${id}`, { token });
}

/** Agrégats du tableau de bord (annulées isolées, calculés côté serveur). */
export type OrderStats = {
  range: { from: string | null; to: string | null };
  orders: { total: number; active: number; cancelled: number };
  revenue: { grossCents: number; paidCents: number; unpaidCents: number };
  byStatus: Partial<Record<OrderStatus, number>>;
  byMode: Record<OrderMode, number>;
  daily: { date: string; grossCents: number; orders: number }[];
  rates: { paymentRate: number; cancellationRate: number };
  avgBasketCents: number;
  lateCount: number;
  topDishes: {
    dishId: number | null;
    name: string;
    quantity: number;
    revenueCents: number;
  }[];
};

/** Statistiques agrégées sur un intervalle de dates de livraison (`from`/`to`). */
export function getOrderStats(
  token: string,
  opts: { from?: string; to?: string } = {},
) {
  const params = new URLSearchParams();
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);
  const qs = params.toString();
  return apiFetch<OrderStats>(`/api/v1/orders/stats${qs ? `?${qs}` : ""}`, {
    token,
  });
}

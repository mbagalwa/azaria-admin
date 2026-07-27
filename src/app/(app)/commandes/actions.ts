"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireManagerToken } from "@/lib/auth";
import { updateOrderPayment, updateOrderStatus } from "@/lib/orders";
import type { OrderStatus } from "@/lib/order-status";

/** Change le statut d'une commande (stepper du sheet) et rafraîchit les vues. */
export async function updateOrderStatusAction(
  id: number,
  status: OrderStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await requireManagerToken();
  if (!token) redirect("/login");

  const res = await updateOrderStatus(id, status, token);
  if (!res.ok) return { ok: false, error: res.message };

  revalidatePath("/commandes");
  revalidatePath(`/commandes/${res.data.deliveryDate}`);
  return { ok: true };
}

/** Marque le paiement d'une commande (payé / non payé). */
export async function updateOrderPaymentAction(
  id: number,
  paymentStatus: "paid" | "unpaid",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = await requireManagerToken();
  if (!token) redirect("/login");

  const res = await updateOrderPayment(id, paymentStatus, token);
  if (!res.ok) return { ok: false, error: res.message };

  revalidatePath("/commandes");
  revalidatePath(`/commandes/${res.data.deliveryDate}`);
  return { ok: true };
}

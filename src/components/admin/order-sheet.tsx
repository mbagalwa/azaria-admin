"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  Ban,
  Bike,
  Check,
  ChefHat,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  ShoppingBag,
  StickyNote,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { customerAvatar, customerSeed, formatPhone, whatsappLink } from "@/lib/cover";
import { formatUsd } from "@/lib/format";
import {
  ORDER_FLOW,
  ORDER_MODE_LABEL,
  ORDER_STATUS_CARD_CLASS,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  isTerminalStatus,
  nextStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";
import {
  updateOrderPaymentAction,
  updateOrderStatusAction,
} from "@/app/(app)/commandes/actions";
import type { OrderSummary } from "@/lib/orders";

const STATUS_ICON: Record<OrderStatus, LucideIcon> = {
  pending: Clock,
  confirmed: Check,
  preparing: ChefHat,
  ready: PackageCheck,
  delivering: Bike,
  delivered: Check,
  picked_up: ShoppingBag,
  cancelled: X,
};

const eventFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function OrderSheet({
  order,
  quantity,
}: {
  order: OrderSummary;
  quantity?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [statusPending, startStatus] = useTransition();
  const [payPending, startPay] = useTransition();

  const name = order.customer.fullName;
  const waLink = whatsappLink(order.customer.phone);
  const cancelled = order.status === "cancelled";
  const terminal = isTerminalStatus(order.status);
  const flow = ORDER_FLOW[order.mode];
  const currentIdx = flow.indexOf(order.status);
  const next = nextStatus(order.mode, order.status);
  const paid = order.paymentStatus === "paid";

  // Timeline sans répétition consécutive (défensif).
  const timeline = order.events.filter(
    (e, i) => i === 0 || e.status !== order.events[i - 1].status,
  );

  function advance(status: OrderStatus) {
    setError(null);
    startStatus(async () => {
      const res = await updateOrderStatusAction(order.id, status);
      if (!res.ok) setError(res.error);
    });
  }
  function togglePayment() {
    setError(null);
    startPay(async () => {
      const res = await updateOrderPaymentAction(
        order.id,
        paid ? "unpaid" : "paid",
      );
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            className={cn(
              "w-full cursor-pointer rounded-lg border px-2 py-1.5 text-left transition-opacity hover:opacity-80",
              ORDER_STATUS_CARD_CLASS[order.status],
            )}
            aria-label={`Commande de ${name} à ${order.deliveryTime}`}
          >
            <span className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={customerAvatar(customerSeed(order.customer))} alt="" />
                <AvatarFallback>{order.customer.initials}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-xs font-semibold text-foreground",
                    cancelled && "line-through opacity-60",
                  )}
                >
                  {name}
                </span>
                <span className="block text-[0.65rem] text-muted-foreground">
                  {order.deliveryTime}
                  {quantity !== undefined && ` · ×${quantity}`}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] font-medium",
                  ORDER_STATUS_CLASS[order.status],
                )}
              >
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </span>
          </button>
        }
      />

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Commande {order.code}</SheetTitle>
          <SheetDescription>
            {order.deliveryDate} · {order.deliveryTime} ·{" "}
            {ORDER_MODE_LABEL[order.mode]}
          </SheetDescription>
        </SheetHeader>

        {/* Client — pas de compte : nom + WhatsApp saisis à la commande. */}
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Avatar>
            <AvatarImage src={customerAvatar(customerSeed(order.customer))} alt="" />
            <AvatarFallback>{order.customer.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatPhone(order.customer.phone) || "Numéro non renseigné"}
            </p>
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              WhatsApp
            </a>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {/* Statut : progression + étape suivante */}
        <div className="space-y-2.5">
          <p className="text-sm font-semibold text-foreground">Statut</p>
          <div className="flex flex-wrap gap-1.5">
            {flow.map((status, i) => {
              const done = currentIdx >= 0 && i < currentIdx;
              const current = i === currentIdx;
              return (
                <span
                  key={status}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                    current
                      ? "border-primary bg-primary text-primary-foreground"
                      : done
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {done && <Check className="size-3" aria-hidden="true" />}
                  {ORDER_STATUS_LABEL[status]}
                </span>
              );
            })}
            {cancelled && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  ORDER_STATUS_CLASS.cancelled,
                )}
              >
                {ORDER_STATUS_LABEL.cancelled}
              </span>
            )}
          </div>

          {terminal ? (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {cancelled ? "Commande annulée." : "Commande terminée."}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {next && (
                <Button
                  size="lg"
                  onClick={() => advance(next)}
                  disabled={statusPending}
                >
                  {statusPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight aria-hidden="true" />
                  )}
                  Passer à « {ORDER_STATUS_LABEL[next]} »
                </Button>
              )}
              <ConfirmDialog
                title={`Annuler la commande ${order.code} ?`}
                description="Le client devra repasser commande. L'annulation reste visible dans l'historique."
                confirmLabel="Annuler la commande"
                destructive
                onConfirm={async () => {
                  const res = await updateOrderStatusAction(order.id, "cancelled");
                  return res.ok ? undefined : { error: res.error };
                }}
                trigger={
                  <Button variant="destructive" size="lg" disabled={statusPending}>
                    <Ban aria-hidden="true" />
                    Annuler
                  </Button>
                }
              />
            </div>
          )}
        </div>

        {/* Paiement */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
          <div className="flex items-center gap-2.5">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {PAYMENT_METHOD_LABEL[order.paymentMethod]}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                  paid
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
              </span>
            </div>
          </div>
          <Button
            variant={paid ? "outline" : "default"}
            size="sm"
            onClick={togglePayment}
            disabled={payPending}
          >
            {payPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {paid ? "Marquer non payé" : "Marquer payé"}
          </Button>
        </div>

        {/* Plats + frais + total */}
        <ul className="divide-y divide-border rounded-xl border border-border">
          {order.items.map((item) => {
            /** Les suppléments sont facturés par assiette, donc ×quantité. */
            const extrasCents = item.accompaniments.reduce(
              (sum, a) => sum + a.priceCents,
              0,
            );
            return (
              <li key={item.id} className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate font-semibold text-foreground">
                    ×{item.quantity} {item.name}
                  </span>
                  <span className="shrink-0 font-medium text-muted-foreground">
                    {formatUsd((item.priceCents + extrasCents) * item.quantity)}
                  </span>
                </div>
                {item.accompaniments.length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-4 text-xs text-muted-foreground">
                    {item.accompaniments.map((a) => (
                      <li key={a.id} className="flex justify-between gap-2">
                        <span className="truncate">↳ {a.name}</span>
                        {a.priceCents > 0 && (
                          <span className="shrink-0">
                            + {formatUsd(a.priceCents * item.quantity)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
          {order.deliveryFeeCents > 0 && (
            <li className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground">
              <span>Frais de livraison</span>
              <span>{formatUsd(order.deliveryFeeCents)}</span>
            </li>
          )}
          <li className="flex items-center justify-between px-3 py-2 text-sm font-bold">
            <span>Total</span>
            <span className="text-primary">{formatUsd(order.totalCents)}</span>
          </li>
        </ul>

        {order.address && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {order.address}
              {order.landmark && (
                <span className="block text-xs">Repère : {order.landmark}</span>
              )}
            </span>
          </p>
        )}
        {order.note && (
          <p className="flex items-start gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <StickyNote className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {order.note}
          </p>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Historique</p>
          <ol className="relative space-y-4 border-l border-border pl-5">
            {timeline.map((event, i) => {
              const Icon = STATUS_ICON[event.status];
              const isLast = i === timeline.length - 1;
              return (
                <li key={event.id} className="relative">
                  <span
                    className={cn(
                      "absolute left-[-1.85rem] flex size-6 items-center justify-center rounded-full ring-4 ring-card",
                      ORDER_STATUS_CLASS[event.status],
                    )}
                  >
                    <Icon className="size-3" aria-hidden="true" />
                  </span>
                  <p
                    className={cn(
                      "text-sm",
                      isLast
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {ORDER_STATUS_LABEL[event.status]}
                    {isLast && " · état actuel"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {eventFormatter.format(new Date(event.createdAt))}
                  </p>
                </li>
              );
            })}
            {timeline.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Aucun historique pour cette commande.
              </li>
            )}
          </ol>
        </div>
      </SheetContent>
    </Sheet>
  );
}

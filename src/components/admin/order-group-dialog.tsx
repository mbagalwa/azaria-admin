"use client";

import { Bike, Clock, ShoppingBag } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { customerAvatar, customerSeed } from "@/lib/cover";
import { formatUsd } from "@/lib/format";
import {
  ORDER_MODE_LABEL,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderSummary } from "@/lib/orders";

const MAX_AVATARS = 3;

/**
 * Un « rendez-vous » du calendrier : les commandes d'un même jour partageant
 * la même heure de livraison, avec le cluster d'avatars des clients. Le clic
 * ouvre le détail du créneau en modal.
 */
export function OrderGroupDialog({
  dateLabel,
  time,
  orders,
  variant = "card",
  dimmed = false,
}: {
  dateLabel: string;
  time: string;
  orders: OrderSummary[];
  /** `card` = chip avec avatars (vue semaine) ; `line` = ligne compacte (vue mois). */
  variant?: "card" | "line";
  /** Atténué (jour passé / hors mois) dans la vue mois. */
  dimmed?: boolean;
}) {
  // Les commandes annulées restent listées, mais ne comptent NI dans le nombre
  // affiché NI dans le total (sinon le planning et le « CA au total » gonflent).
  const active = orders.filter((o) => o.status !== "cancelled");
  const activeCount = active.length;
  const cancelledCount = orders.length - activeCount;
  const shown = active.slice(0, MAX_AVATARS);
  const rest = activeCount - shown.length;
  const total = active.reduce((s, o) => s + o.totalCents, 0);

  const cardTrigger = (
    <button
      type="button"
      className="w-full cursor-pointer rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-left transition-colors hover:border-ring/40 hover:bg-muted"
      aria-label={`${activeCount} commande${activeCount > 1 ? "s" : ""} à ${time}`}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {time}
        </span>
        <span className="rounded-full bg-primary px-1.5 text-[0.65rem] font-bold leading-4 text-primary-foreground">
          {activeCount}
        </span>
      </span>
      <span className="mt-1.5 flex">
        <AvatarGroup>
          {shown.map((o) => (
            <Avatar key={o.id} size="sm">
              <AvatarImage src={customerAvatar(customerSeed(o.customer))} alt="" />
              <AvatarFallback>{o.customer.initials}</AvatarFallback>
            </Avatar>
          ))}
          {rest > 0 && (
            <AvatarGroupCount className="size-6 text-[0.65rem]">
              +{rest}
            </AvatarGroupCount>
          )}
        </AvatarGroup>
      </span>
    </button>
  );

  /** Ligne compacte façon agenda : | 12:00 · 3 */
  const lineTrigger = (
    <button
      type="button"
      className={cn(
        "flex w-full cursor-pointer items-center gap-1 rounded bg-muted/50 px-1 py-0.5 text-left text-[0.7rem] leading-4 transition-colors hover:bg-muted",
        dimmed && "opacity-55",
      )}
      aria-label={`${activeCount} commande${activeCount > 1 ? "s" : ""} à ${time}`}
    >
      <span
        className={cn(
          "h-3 w-0.5 shrink-0 rounded-full",
          dimmed ? "bg-muted-foreground/60" : "bg-primary",
        )}
        aria-hidden="true"
      />
      <span className="truncate font-semibold text-foreground">{time}</span>
      <span className="shrink-0 text-muted-foreground">· {activeCount} cmd</span>
    </button>
  );

  return (
    <Dialog>
      <DialogTrigger render={variant === "line" ? lineTrigger : cardTrigger} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {dateLabel} · {time}
          </DialogTitle>
          <DialogDescription>
            {activeCount} commande{activeCount > 1 ? "s" : ""} · {formatUsd(total)}{" "}
            au total
            {cancelledCount > 0
              ? ` · ${cancelledCount} annulée${cancelledCount > 1 ? "s" : ""}`
              : ""}
            .
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex items-center gap-3 rounded-lg border border-border p-2.5"
            >
              <Avatar>
                <AvatarImage src={customerAvatar(customerSeed(o.customer))} alt="" />
                <AvatarFallback>{o.customer.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {o.customer.fullName}
                </p>
                <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  <span>{o.code}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    {o.mode === "delivery" ? (
                      <Bike className="size-3" aria-hidden="true" />
                    ) : (
                      <ShoppingBag className="size-3" aria-hidden="true" />
                    )}
                    {ORDER_MODE_LABEL[o.mode]}
                  </span>
                  <span>·</span>
                  <span>
                    {o.itemsCount} plat{o.itemsCount > 1 ? "s" : ""}
                  </span>
                  <span>·</span>
                  <span>
                    {PAYMENT_METHOD_LABEL[o.paymentMethod]} (
                    {PAYMENT_STATUS_LABEL[o.paymentStatus]})
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-bold text-primary">
                  {formatUsd(o.totalCents)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                    ORDER_STATUS_CLASS[o.status],
                  )}
                >
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Transmit } from "@adonisjs/transmit-client";
import { useToast } from "@/components/ui/toast";
import { formatFR } from "@/lib/dates";

type AdminOrderEvent = {
  type: "created" | "updated";
  id: number;
  code?: string;
  date?: string | null;
  status?: string;
};

/**
 * Écoute le canal SSE `admin/orders`. À chaque nouvelle commande : un toast
 * cliquable (→ planning du jour). Toute mutation rafraîchit les composants
 * serveur de la page courante (debounce pour lisser les rafales).
 */
export function OrdersRealtime() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return;

    const transmit = new Transmit({ baseUrl });
    const subscription = transmit.subscription("admin/orders");
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    subscription
      .create()
      .then(() => {
        subscription.onMessage((data: AdminOrderEvent) => {
          if (data?.type === "created") {
            const when = data.date ? ` — livraison le ${formatFR(data.date)}` : "";
            toast({
              title: "Nouvelle commande 🛎️",
              message: `${data.code ?? "Commande reçue"}${when}`,
              href: data.date ? `/commandes/${data.date}` : undefined,
            });
          }
          clearTimeout(timer);
          timer = setTimeout(() => {
            if (!stopped) router.refresh();
          }, 400);
        });
      })
      .catch(() => {});

    return () => {
      stopped = true;
      clearTimeout(timer);
      subscription.delete().catch(() => {});
      transmit.close();
    };
  }, [router, toast]);

  return null;
}

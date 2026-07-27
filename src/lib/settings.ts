import "server-only";
import { apiFetch } from "@/lib/api";

/** Un service de vente et son heure limite de commande (cut-off). */
export type ServiceSlot = { name: string; cutoff: string };

export type RestaurantSettings = {
  currency: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  hours: string | null;
  deliveryFeeCents: number;
  /** Heure limite (HH:MM) pour commander le jour même — source de vérité unique. */
  orderCutoff: string;
  services: ServiceSlot[];
};

export type NotificationsSettings = {
  emailEnabled: boolean;
  /** Canal client : accusé de réception + suivi de statut. */
  whatsappEnabled: boolean;
  senderEmail: string | null;
  /** Numéro WhatsApp de l'ÉQUIPE, destinataire des alertes internes. */
  whatsappNumber: string | null;
  /** Canal interne : alerte de l'équipe à chaque nouvelle commande. */
  telegramEnabled: boolean;
  telegramChatId: string | null;
  notifyNewOrder: boolean;
  notifyStatusChange: boolean;
  /**
   * Templates Meta approuvés. Obligatoires en production : hors de la fenêtre
   * de service de 24 h, WhatsApp refuse les messages texte libres.
   */
  whatsappTemplateOrderReceived: string | null;
  whatsappTemplateStatusChange: string | null;
};

export type AppSettings = {
  restaurant: RestaurantSettings;
  notifications: NotificationsSettings;
};

export function getSettings(token: string) {
  return apiFetch<AppSettings>("/api/v1/settings", { token });
}

export function updateRestaurant(body: Record<string, unknown>, token: string) {
  return apiFetch<RestaurantSettings>("/api/v1/settings/restaurant", {
    method: "PUT",
    body,
    token,
  });
}

export function updateNotifications(
  body: Record<string, unknown>,
  token: string,
) {
  return apiFetch<NotificationsSettings>("/api/v1/settings/notifications", {
    method: "PUT",
    body,
    token,
  });
}

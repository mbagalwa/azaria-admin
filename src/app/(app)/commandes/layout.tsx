import { OrdersRealtime } from "@/components/admin/orders-realtime";

/** Ajoute l'écoute temps réel des commandes à toutes les pages Commandes. */
export default function CommandesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <OrdersRealtime />
    </>
  );
}

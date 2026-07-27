import { redirect } from "next/navigation";
import { Navbar } from "@/components/admin/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentUser, getToken } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { customerSeed } from "@/lib/cover";
import type { OrderStatus } from "@/lib/order-status";

/** Statuts « en cours » : ni terminées (delivered/picked_up) ni annulées. */
const IN_PROGRESS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivering",
];

/**
 * Shell du back-office : un navbar horizontal (logo + onglets + menu
 * utilisateur), le contenu en dessous. Protège toutes les routes du
 * groupe (app) : sans session valide (rôle manager), retour au login.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Cluster navbar : avatars des clients ayant une commande en cours + total.
  const token = await getToken();
  const res = token ? await listOrders(token, { limit: 100 }) : null;
  const orders = res?.ok ? res.data : [];
  const inProgress = orders.filter((o) => IN_PROGRESS.includes(o.status));
  const seen = new Set<string>();
  const clients = inProgress
    .filter((o) => {
      const seed = customerSeed(o.customer);
      if (seen.has(seed)) return false;
      seen.add(seed);
      return true;
    })
    .slice(0, 4)
    .map((o) => ({
      seed: customerSeed(o.customer),
      initials: o.customer.initials,
      name: o.customer.fullName,
    }));

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-(--app-background)">
        <Navbar
          user={{
            fullName: user.fullName,
            email: user.email,
            initials: user.initials,
            role: user.role,
          }}
          clients={clients}
          ordersInProgress={inProgress.length}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </ToastProvider>
  );
}

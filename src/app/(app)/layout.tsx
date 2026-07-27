import { redirect } from "next/navigation";
import { Navbar } from "@/components/admin/navbar";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentUser } from "@/lib/auth";

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

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#eaeaea]">
        <Navbar
          user={{
            fullName: user.fullName,
            email: user.email,
            initials: user.initials,
            role: user.role,
          }}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </ToastProvider>
  );
}

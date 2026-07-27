import { ParametresSidebar } from "@/components/admin/parametres-sidebar";
import { ParametresMobileMenu } from "@/components/admin/parametres-mobile-menu";

/**
 * Coquille des Paramètres : titre en tête, barre latérale des sous-sections
 * à gauche, contenu de la sous-page à droite. Sur desktop, deux colonnes avec
 * la sidebar ; sur mobile, un menu hamburger (« Menus ») au-dessus du contenu.
 */
export default function ParametresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez le catalogue, l&apos;équipe et la configuration du restaurant.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Mobile : menu hamburger */}
        <div className="lg:hidden">
          <ParametresMobileMenu />
        </div>

        {/* Desktop : sidebar complète */}
        <aside className="hidden lg:block lg:w-72 lg:shrink-0">
          <ParametresSidebar />
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}

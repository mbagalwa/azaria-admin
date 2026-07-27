import Image from "next/image";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Connexion",
};

export default async function LoginPage() {
  // Déjà connecté → on file au tableau de bord.
  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background/90 p-4">
      {/* Carte bornée (largeur + hauteur fixes sur desktop) pour éviter
          les grands espaces vides autour du formulaire. */}
      <div className="grid w-full max-w-5xl overflow-hidden rounded-md border-[0.5px] border-gray-200/80 lg:h-150 lg:grid-cols-[55fr_45fr]">
        {/* ---------------------- Panneau de marque (gauche, ~55% en desktop) */}
        <aside className="relative hidden flex-col justify-end overflow-hidden p-12 lg:flex xl:p-16">
          {/* Photo de plat en fond */}
          <Image
            src="/login-bg.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 0px, 60vw"
            className="object-cover"
          />
          {/* Voile sombre (vert Azaria) pour la lisibilité du texte */}
          <div
            className="absolute inset-0 bg-linear-to-t from-[#0d2b21]/95 via-[#123b2e]/55 to-[#123b2e]/30"
            aria-hidden="true"
          />

          {/* Bloc de texte - plus d'espace autour et une accroche plus grande */}
          <div className="relative z-10 max-w-md space-y-5 pb-2">
            <p className="text-sm font-medium tracking-wide text-white/85">
              Back-office Azaria
            </p>
            <p className="text-[2.6rem] font-bold leading-[1.1] text-white">
              Le menu et les commandes, pilotés au même endroit.
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-white/75">
              Programmez les plats de la semaine, suivez les commandes et gardez
              tout sous contrôle.
            </p>
          </div>
        </aside>

        {/* ------------------------- Formulaire (droite, ~40% en desktop) */}
        <section className="flex flex-col justify-center bg-card px-6 py-12 sm:px-12 lg:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Logo côté formulaire, à toutes les tailles */}
            <div className="mb-8">
              <Logo />
            </div>

            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Espace administrateur
            </h1>
            <p className="mt-2 text-[0.83rem] font-medium text-muted-foreground">
              Connectez-vous pour gérer le menu et les commandes.
            </p>

            <div className="mt-8">
              <LoginForm />
            </div>

            <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
              Cet espace est strictement réservé au personnel autorisé
              d&apos;Azaria.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

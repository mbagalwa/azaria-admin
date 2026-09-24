import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Police principale du back-office - geometric sans, dans l'esprit demandé.
const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Azaria · Administration",
    template: "%s · Azaria Admin",
  },
  description: "Back-office Azaria - gestion du menu et des commandes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Les extensions de navigateur (LanguageTool, Grammarly…) ajoutent leurs
    // attributs sur <html> avant l'hydratation : on ignore l'écart sur ce
    // seul élément, sans masquer les vrais décalages plus bas dans l'arbre.
    <html
      lang="fr"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

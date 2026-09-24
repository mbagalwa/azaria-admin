import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

/**
 * Garde de routes (ex-`middleware`, renommé `proxy` en Next 16).
 *
 * Le proxy ne tranche que le cas non ambigu : *aucun* cookie de session →
 * /login, sans payer un aller-retour API. Il ne fait volontairement PAS
 * l'inverse (cookie présent sur /login → tableau de bord) : il ne voit que
 * la présence du cookie, pas sa validité. Un token périmé passerait alors
 * la garde, le layout `(app)` le rejetterait vers /login, le proxy le
 * renverrait au tableau de bord → boucle de redirection infinie.
 *
 * La redirection « déjà connecté → tableau de bord » vit donc dans
 * `login/page.tsx`, qui valide réellement le token via `getCurrentUser()`.
 */
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(TOKEN_COOKIE);
  const isLoginRoute = request.nextUrl.pathname === "/login";

  if (!hasToken && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // On exclut les assets statiques et tout fichier avec extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\..*).*)"],
};

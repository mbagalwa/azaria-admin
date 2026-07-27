import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

/**
 * Garde de routes (ex-`middleware`, renommé `proxy` en Next 16).
 *
 * Contrôle grossier basé sur la présence du cookie : sans session on
 * renvoie vers /login, avec session on empêche de revenir sur /login.
 * La validation réelle du token se fait dans les pages serveur via
 * `getCurrentUser()`.
 */
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(TOKEN_COOKIE);
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";

  if (!hasToken && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasToken && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // On exclut les assets statiques et tout fichier avec extension.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\..*).*)"],
};

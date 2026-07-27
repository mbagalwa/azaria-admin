import "server-only";
import { cookies } from "next/headers";
import { apiFetch, type ApiUser } from "@/lib/api";
import { TOKEN_COOKIE } from "@/lib/constants";

/** Durée de vie du cookie (30 jours). */
const TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

/** Lit le token depuis le cookie httpOnly (ou null). */
export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

/** Pose le cookie de session (httpOnly). */
export async function setToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
  });
}

/** Supprime le cookie de session. */
export async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

/**
 * Renvoie l'utilisateur courant en validant réellement le token auprès
 * de l'API (pas seulement la présence du cookie). `null` si pas de
 * session valide ou si le compte n'est pas un administrateur.
 */
export async function getCurrentUser(): Promise<ApiUser | null> {
  const token = await getToken();
  if (!token) return null;

  const res = await apiFetch<ApiUser>("/api/v1/account/profile", { token });
  if (!res.ok) return null;
  if (res.data.role !== "manager") return null;

  return res.data;
}

/**
 * Renvoie le token SI le compte est un manager valide, sinon `null`.
 *
 * À utiliser en tête des Server Actions mutantes : ce sont des endpoints POST
 * appelables directement, que la garde du layout `(app)` ne couvre pas. Défense
 * en profondeur — l'API revérifie de toute façon le rôle (403).
 */
export async function requireManagerToken(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return getToken();
}

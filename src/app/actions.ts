"use server";

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

/**
 * Déconnexion : révoque le token côté API (best-effort) puis supprime le
 * cookie de session et renvoie vers la page de login.
 */
export async function logoutAction() {
  const token = await getToken();
  if (token) {
    await apiFetch("/api/v1/account/logout", { method: "POST", token });
  }
  await clearToken();
  redirect("/login");
}

"use server";

import { redirect } from "next/navigation";
import { apiFetch, type ApiUser } from "@/lib/api";
import { setToken } from "@/lib/auth";

export type LoginState = { error?: string; email?: string };

/**
 * Authentifie l'administrateur auprès de l'API, pose le cookie de
 * session httpOnly, puis redirige vers le tableau de bord. En cas
 * d'erreur, renvoie l'email saisi pour le repré-remplir (React 19
 * réinitialise le formulaire après une action).
 */
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Renseignez votre email et votre mot de passe.", email };
  }

  const res = await apiFetch<{ token: string; user: ApiUser }>(
    "/api/v1/auth/login",
    { method: "POST", body: { email, password } },
  );

  if (!res.ok) {
    return {
      email,
      error:
        res.status === 400 || res.status === 401
          ? "Email ou mot de passe incorrect."
          : res.message,
    };
  }

  if (res.data.user.role !== "manager") {
    return {
      email,
      error: "Ce compte n'a pas accès à l'administration.",
    };
  }

  await setToken(res.data.token);
  redirect("/");
}

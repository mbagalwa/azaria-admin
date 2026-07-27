import "server-only";
import { apiFetch, type ApiResult } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:3333";

/** Un plat tel que renvoyé par l'API (`imagePublicId` reste interne côté API). */
export type ApiDish = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export { formatUsd } from "@/lib/format";

export function listDishes(token: string) {
  return apiFetch<ApiDish[]>("/api/v1/dishes", { token });
}

export function getDish(id: string | number, token: string) {
  return apiFetch<ApiDish>(`/api/v1/dishes/${id}`, { token });
}

export function deleteDish(id: string | number, token: string) {
  return apiFetch<{ message: string }>(`/api/v1/dishes/${id}`, {
    method: "DELETE",
    token,
  });
}

/**
 * Envoi multipart (création / mise à jour). `apiFetch` ne gère que le JSON,
 * on passe donc par un fetch direct pour transporter le fichier image.
 */
async function sendDish(
  path: string,
  method: string,
  body: FormData,
  token: string,
): Promise<ApiResult<ApiDish>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      // Pas de Content-Type manuel : fetch pose la frontière multipart.
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        payload?.errors?.[0]?.message ??
        payload?.message ??
        "Une erreur est survenue.";
      return { ok: false, status: res.status, message };
    }

    return { ok: true, data: (payload?.data ?? payload) as ApiDish };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Impossible de joindre le serveur. Réessayez.",
    };
  }
}

export function createDish(body: FormData, token: string) {
  return sendDish("/api/v1/dishes", "POST", body, token);
}

export function updateDish(id: string | number, body: FormData, token: string) {
  return sendDish(`/api/v1/dishes/${id}`, "PUT", body, token);
}

import "server-only";
import { apiFetch, type ApiResult } from "@/lib/api";

const API_URL = process.env.API_URL ?? "http://localhost:3333";

/**
 * Un accompagnement du catalogue. `priceCents` à 0 = inclus dans le prix du
 * plat ; au-delà, c'est un supplément facturé par assiette.
 */
export type ApiAccompaniment = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export { formatUsd } from "@/lib/format";

export function listAccompaniments(token: string) {
  return apiFetch<ApiAccompaniment[]>("/api/v1/accompaniments", { token });
}

export function getAccompaniment(id: string | number, token: string) {
  return apiFetch<ApiAccompaniment>(`/api/v1/accompaniments/${id}`, { token });
}

export function deleteAccompaniment(id: string | number, token: string) {
  return apiFetch<{ message: string }>(`/api/v1/accompaniments/${id}`, {
    method: "DELETE",
    token,
  });
}

/**
 * Envoi multipart (création / mise à jour) : `apiFetch` ne gère que le JSON,
 * on passe par un fetch direct pour transporter le fichier image.
 */
async function send(
  path: string,
  method: string,
  body: FormData,
  token: string,
): Promise<ApiResult<ApiAccompaniment>> {
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

    return { ok: true, data: (payload?.data ?? payload) as ApiAccompaniment };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Impossible de joindre le serveur. Réessayez.",
    };
  }
}

export function createAccompaniment(body: FormData, token: string) {
  return send("/api/v1/accompaniments", "POST", body, token);
}

export function updateAccompaniment(
  id: string | number,
  body: FormData,
  token: string,
) {
  return send(`/api/v1/accompaniments/${id}`, "PUT", body, token);
}

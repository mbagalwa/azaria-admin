/**
 * Client HTTP minimal pour l'API AdonisJS.
 *
 * Volontairement simple pour ce module. Quand on mettra en place le SDK
 * typé partagé (Tuyau, déjà présent côté API), on remplacera ce fichier
 * sans toucher aux appelants.
 */
const API_URL = process.env.API_URL ?? "http://localhost:3333";

export type ApiUser = {
  id: number;
  fullName: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  initials: string;
};

/** Métadonnées de pagination renvoyées par l'API (`?page=&limit=`). */
export type PageMeta = {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
};

export type ApiResult<T> =
  | { ok: true; data: T; meta?: PageMeta }
  | { ok: false; status: number; message: string };

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string;
};

/**
 * Appelle l'API et normalise la réponse `{ data }` / `{ errors }` de
 * l'API en un résultat discriminé, sans jamais lever d'exception réseau.
 */
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
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

    return {
      ok: true,
      data: (payload?.data ?? payload) as T,
      meta: (payload?.metadata ?? payload?.meta) as PageMeta | undefined,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Impossible de joindre le serveur. Réessayez.",
    };
  }
}

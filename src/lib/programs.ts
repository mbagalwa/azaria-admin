import "server-only";
import { apiFetch } from "@/lib/api";

/** Résumé d'un programme (liste). */
export type ProgramSummary = {
  id: number;
  code: string;
  title: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  scheduledDaysCount: number;
  dishesCount: number;
  ordersCount: number;
  createdAt: string;
};

/** Accompagnement proposé avec le plat du jour, à prix figé. */
export type ProgramDayAccompaniment = {
  id: number;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

export type ProgramDayDish = {
  id: number;
  name: string;
  description: string | null;
  priceCents: number;
  category: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  accompaniments: ProgramDayAccompaniment[];
};

/** UN SEUL plat par date : c'est le plat du jour. */
export type ProgramDay = { date: string; dish: ProgramDayDish };

/** Détail d'un programme (le plat du jour, par date). */
export type ProgramDetail = ProgramSummary & {
  updatedAt: string | null;
  days: ProgramDay[];
};

/** Payload envoyé à l'API pour créer/mettre à jour un programme. */
export type ProgramPayload = {
  title: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  entries: {
    date: string;
    dishId: number;
    priceCents: number;
    accompaniments: { accompanimentId: number; priceCents: number }[];
  }[];
};

export function listPrograms(
  token: string,
  opts: { page?: number; limit?: number } = {},
) {
  const params = new URLSearchParams();
  if (opts.page) params.set("page", String(opts.page));
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  return apiFetch<ProgramSummary[]>(`/api/v1/programs${qs ? `?${qs}` : ""}`, {
    token,
  });
}

export function getProgram(id: string | number, token: string) {
  return apiFetch<ProgramDetail>(`/api/v1/programs/${id}`, { token });
}

export function createProgram(body: ProgramPayload, token: string) {
  return apiFetch<ProgramDetail>("/api/v1/programs", {
    method: "POST",
    body,
    token,
  });
}

export function updateProgram(
  id: string | number,
  body: ProgramPayload,
  token: string,
) {
  return apiFetch<ProgramDetail>(`/api/v1/programs/${id}`, {
    method: "PUT",
    body,
    token,
  });
}

export function deleteProgram(id: string | number, token: string) {
  return apiFetch<{ message: string }>(`/api/v1/programs/${id}`, {
    method: "DELETE",
    token,
  });
}

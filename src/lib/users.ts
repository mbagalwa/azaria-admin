import "server-only";
import { apiFetch, type ApiUser } from "@/lib/api";

/** Un compte du staff (mêmes champs que ApiUser). */
export type StaffUser = ApiUser;

export { STAFF_ROLES, roleLabel } from "@/lib/roles";

export function listUsers(token: string) {
  return apiFetch<StaffUser[]>("/api/v1/users", { token });
}

export function getUser(id: string | number, token: string) {
  return apiFetch<StaffUser>(`/api/v1/users/${id}`, { token });
}

export function createUser(body: Record<string, unknown>, token: string) {
  return apiFetch<StaffUser>("/api/v1/users", { method: "POST", body, token });
}

export function updateUser(
  id: string | number,
  body: Record<string, unknown>,
  token: string,
) {
  return apiFetch<StaffUser>(`/api/v1/users/${id}`, {
    method: "PUT",
    body,
    token,
  });
}

export function deleteUser(id: string | number, token: string) {
  return apiFetch<{ message: string }>(`/api/v1/users/${id}`, {
    method: "DELETE",
    token,
  });
}

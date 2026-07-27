/** Rôles du staff - module neutre (importable côté client comme serveur). */

export const STAFF_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "cuisine", label: "Cuisine" },
] as const;

export function roleLabel(role: string): string {
  return STAFF_ROLES.find((r) => r.value === role)?.label ?? role;
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getToken } from "@/lib/auth";
import { updateRestaurant } from "@/lib/settings";

const PATH = "/parametres/restaurant";

export type SettingsFormState = { ok?: boolean; error?: string };

export async function saveRestaurantAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const field = (k: string) => String(formData.get(k) ?? "").trim();

  const names = formData.getAll("serviceName").map((v) => String(v).trim());
  const cutoffs = formData.getAll("serviceCutoff").map((v) => String(v).trim());
  const services = names
    .map((name, i) => ({ name, cutoff: cutoffs[i] ?? "" }))
    .filter((s) => s.name && s.cutoff);

  const feeDollars = Number.parseFloat(field("deliveryFee").replace(",", "."));
  const deliveryFeeCents =
    Number.isFinite(feeDollars) && feeDollars >= 0
      ? Math.round(feeDollars * 100)
      : 0;

  const cutoff = field("orderCutoff");
  const orderCutoff = /^([01]\d|2[0-3]):[0-5]\d$/.test(cutoff) ? cutoff : "09:00";

  const body = {
    currency: field("currency") || "USD",
    phone: field("phone") || null,
    whatsapp: field("whatsapp") || null,
    email: field("email") || null,
    address: field("address") || null,
    city: field("city") || null,
    hours: field("hours") || null,
    deliveryFeeCents,
    orderCutoff,
    services,
  };

  const res = await updateRestaurant(body, token);
  if (!res.ok) return { error: res.message };

  revalidatePath(PATH);
  return { ok: true };
}
